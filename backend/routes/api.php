<?php

use App\Models\PaymentMethod;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

$serializeUser = static function (User $user): array {
    return [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'phone' => $user->phone,
        'date_of_birth' => optional($user->date_of_birth)->format('Y-m-d'),
    ];
};

$serializePaymentMethod = static function (PaymentMethod $paymentMethod): array {
    $maskedNumber = $paymentMethod->card_last4
        ? sprintf('**** **** **** %s', $paymentMethod->card_last4)
        : null;

    return [
        'id' => $paymentMethod->id,
        'method_type' => $paymentMethod->method_type,
        'label' => $paymentMethod->label,
        'card_brand' => $paymentMethod->card_brand,
        'masked_number' => $maskedNumber,
        'expires_at' => $paymentMethod->expires_at,
        'is_default' => $paymentMethod->is_default,
    ];
};

$serializePaymentMethods = static function ($paymentMethods) use ($serializePaymentMethod): array {
    return $paymentMethods
        ->map($serializePaymentMethod)
        ->values()
        ->all();
};

$serializeOrderItem = static function (OrderItem $orderItem): array {
    return [
        'id' => $orderItem->id,
        'name' => $orderItem->item_name,
        'unit_price' => $orderItem->item_price,
        'quantity' => $orderItem->quantity,
        'line_total' => $orderItem->line_total,
        'image' => $orderItem->item_image,
    ];
};

$serializeOrder = static function (Order $order) use ($serializeOrderItem): array {
    $paymentTypeLabels = [
        'card' => 'Банковская карта',
        'sbp' => 'СБП',
        'cash' => 'Наличными',
    ];

    return [
        'id' => $order->id,
        'order_number' => $order->order_number,
        'status' => $order->status,
        'delivery_type' => $order->delivery_type,
        'pickup_branch' => $order->pickup_branch,
        'delivery_address' => $order->delivery_address,
        'payment_method_type' => $order->payment_method_type,
        'payment_method_id' => $order->payment_method_id,
        'payment_method_label' => $order->paymentMethod?->label ?: ($paymentTypeLabels[$order->payment_method_type] ?? $order->payment_method_type),
        'items_count' => $order->items_count,
        'total_amount' => $order->total_amount,
        'currency' => $order->currency,
        'comment' => $order->comment,
        'created_at' => optional($order->created_at)->toIso8601String(),
        'items' => $order->items->map($serializeOrderItem)->values()->all(),
    ];
};

$serializeOrders = static function ($orders) use ($serializeOrder): array {
    return $orders
        ->map($serializeOrder)
        ->values()
        ->all();
};

$sendPasswordChangeCode = static function (User $user, string $code): void {
    $subject = 'Password Change Confirmation';
    $body = "Password change confirmation code: {$code}. The code expires in 15 minutes.";

    $resendApiKey = (string) env('RESEND_API_KEY', '');
    $resendFrom = (string) env('RESEND_FROM', '');

    if ($resendApiKey === '' || $resendFrom === '') {
        throw new \RuntimeException('RESEND_API_KEY and RESEND_FROM must be configured.');
    }

    $response = Http::withToken($resendApiKey)
        ->acceptJson()
        ->timeout(20)
        ->post('https://api.resend.com/emails', [
            'from' => $resendFrom,
            'to' => [$user->email],
            'subject' => $subject,
            'text' => $body,
        ]);

    if ($response->failed()) {
        $errorPayload = $response->json();
        $errorText = is_array($errorPayload)
            ? (string) ($errorPayload['message'] ?? json_encode($errorPayload, JSON_UNESCAPED_UNICODE))
            : $response->body();

        throw new \RuntimeException('Resend API request failed with status '.$response->status().': '.$errorText);
    }
};

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => config('app.name'),
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::prefix('auth')->group(function () use ($serializeUser) {
    Route::post('/register', function (Request $request) use ($serializeUser) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('frontend')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $serializeUser($user),
        ], 201);
    });

    Route::post('/login', function (Request $request) {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        $token = $user->createToken('frontend')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $serializeUser($user),
        ]);
    });

    Route::middleware('auth:sanctum')->group(function () use ($serializeUser) {
        Route::get('/me', function (Request $request) use ($serializeUser) {
            return response()->json([
                'user' => $serializeUser($request->user()),
            ]);
        });

        Route::post('/logout', function (Request $request) {
            $request->user()->currentAccessToken()?->delete();

            return response()->json([
                'message' => 'Logged out successfully.',
            ]);
        });
    });
});

Route::middleware('auth:sanctum')->prefix('profile')->group(function () use ($sendPasswordChangeCode, $serializeOrders, $serializePaymentMethods, $serializeUser) {
    Route::get('/', function (Request $request) use ($serializeOrders, $serializePaymentMethods, $serializeUser) {
        $user = $request->user()->fresh();

        return response()->json([
            'user' => $serializeUser($user),
            'payment_methods' => $serializePaymentMethods(
                $user->paymentMethods()
                    ->orderByDesc('is_default')
                    ->orderByDesc('id')
                    ->get()
            ),
            'orders' => $serializeOrders(
                $user->orders()
                    ->with(['items', 'paymentMethod'])
                    ->orderByDesc('id')
                    ->limit(20)
                    ->get()
            ),
        ]);
    });

    Route::put('/', function (Request $request) use ($serializeUser) {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => ['nullable', 'string', 'max:32'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
        ]);

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
        ]);

        $user->save();

        return response()->json([
            'user' => $serializeUser($user->fresh()),
            'message' => 'Profile updated.',
        ]);
    });

    Route::post('/payment-methods', function (Request $request) use ($serializePaymentMethods) {
        $user = $request->user();

        $validated = $request->validate([
            'method_type' => ['required', Rule::in(['card', 'sbp', 'cash'])],
            'label' => ['nullable', 'string', 'max:60'],
            'card_number' => ['nullable', 'string', 'max:25'],
            'expires_at' => ['nullable', 'regex:/^(0[1-9]|1[0-2])\/\d{2}$/'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        $methodType = $validated['method_type'];
        $cardBrand = null;
        $cardLast4 = null;
        $encryptedCardNumber = null;
        $expiresAt = null;

        if ($methodType === 'card') {
            $cardDigits = preg_replace('/\D+/', '', (string) ($validated['card_number'] ?? ''));

            if (!is_string($cardDigits) || strlen($cardDigits) < 12 || strlen($cardDigits) > 19) {
                throw ValidationException::withMessages([
                    'card_number' => ['Card number must contain 12 to 19 digits.'],
                ]);
            }

            $cardLast4 = substr($cardDigits, -4);
            $encryptedCardNumber = encrypt($cardDigits);
            $expiresAt = $validated['expires_at'] ?? null;

            if (str_starts_with($cardDigits, '4')) {
                $cardBrand = 'VISA';
            } elseif (preg_match('/^5[1-5]/', $cardDigits) === 1) {
                $cardBrand = 'MASTERCARD';
            } else {
                $cardBrand = 'CARD';
            }
        }

        $isDefault = (bool) ($validated['is_default'] ?? false);

        if (!$user->paymentMethods()->exists()) {
            $isDefault = true;
        }

        if ($isDefault) {
            $user->paymentMethods()->update(['is_default' => false]);
        }

        $user->paymentMethods()->create([
            'method_type' => $methodType,
            'label' => $validated['label'] ?? null,
            'card_brand' => $cardBrand,
            'card_last4' => $cardLast4,
            'encrypted_card_number' => $encryptedCardNumber,
            'expires_at' => $expiresAt,
            'is_default' => $isDefault,
        ]);

        return response()->json([
            'payment_methods' => $serializePaymentMethods(
                $user->paymentMethods()
                    ->orderByDesc('is_default')
                    ->orderByDesc('id')
                    ->get()
            ),
            'message' => 'Payment method added.',
        ], 201);
    });

    Route::delete('/payment-methods/{paymentMethod}', function (Request $request, PaymentMethod $paymentMethod) use ($serializePaymentMethods) {
        $user = $request->user();

        if ($paymentMethod->user_id !== $user->id) {
            abort(404);
        }

        $removedDefault = $paymentMethod->is_default;
        $paymentMethod->delete();

        if ($removedDefault) {
            $newDefault = $user->paymentMethods()->latest('id')->first();

            if ($newDefault) {
                $newDefault->is_default = true;
                $newDefault->save();
            }
        }

        return response()->json([
            'payment_methods' => $serializePaymentMethods(
                $user->paymentMethods()
                    ->orderByDesc('is_default')
                    ->orderByDesc('id')
                    ->get()
            ),
            'message' => 'Payment method removed.',
        ]);
    });

    Route::post('/password/change/request', function (Request $request) use ($sendPasswordChangeCode) {
    $validated = $request->validate([
        'new_password' => ['required', 'string', 'min:8', 'confirmed'],
    ]);

    $user = $request->user();
    $cacheKey = "profile_password_change_{$user->id}";
    $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

    Cache::put(
        $cacheKey,
        [
            'code_hash' => hash('sha256', $code),
            'new_password_hash' => Hash::make($validated['new_password']),
        ],
        now()->addMinutes(15)
    );

    try {
        $sendPasswordChangeCode($user, $code);
    } catch (\Throwable $exception) {
        Log::error('Password change confirmation email failed', [
            'user_id' => $user->id,
            'email' => $user->email,
            'error' => $exception->getMessage(),
        ]);

        Cache::forget($cacheKey);

        return response()->json([
            'message' => 'Не удалось отправить код подтверждения на почту. Проверьте RESEND_API_KEY и RESEND_FROM.',
        ], 500);
    }

    return response()->json([
        'message' => 'Confirmation code sent to your email.',
    ]);
});

    Route::post('/password/change/confirm', function (Request $request) {
        $validated = $request->validate([
            'code' => ['required', 'regex:/^\d{6}$/'],
        ]);

        $user = $request->user();
        $cacheKey = "profile_password_change_{$user->id}";
        $payload = Cache::get($cacheKey);

        if (!$payload || !is_array($payload)) {
            throw ValidationException::withMessages([
                'code' => ['Confirmation code expired. Request a new code.'],
            ]);
        }

        $providedCodeHash = hash('sha256', $validated['code']);

        if (!hash_equals((string) ($payload['code_hash'] ?? ''), $providedCodeHash)) {
            throw ValidationException::withMessages([
                'code' => ['Invalid confirmation code.'],
            ]);
        }

        $user->password = (string) $payload['new_password_hash'];
        $user->save();

        Cache::forget($cacheKey);

        return response()->json([
            'message' => 'Password changed successfully.',
        ]);
    });
});

Route::middleware('auth:sanctum')->prefix('orders')->group(function () use ($serializeOrder, $serializeOrders) {
    Route::get('/', function (Request $request) use ($serializeOrders) {
        $orders = $request->user()
            ->orders()
            ->with(['items', 'paymentMethod'])
            ->orderByDesc('id')
            ->limit(50)
            ->get();

        return response()->json([
            'orders' => $serializeOrders($orders),
        ]);
    });

    Route::post('/', function (Request $request) use ($serializeOrder) {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.unit_price' => ['required', 'integer', 'min:1'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.image' => ['nullable', 'string', 'max:2048'],
            'delivery_type' => ['required', Rule::in(['pickup', 'delivery'])],
            'pickup_branch' => ['nullable', 'string', 'max:120'],
            'delivery_address' => ['nullable', 'string', 'max:255'],
            'payment_method_type' => ['required', Rule::in(['card', 'sbp', 'cash'])],
            'payment_method_id' => ['nullable', 'integer'],
            'comment' => ['nullable', 'string', 'max:500'],
        ]);

        $pickupBranch = trim((string) ($validated['pickup_branch'] ?? ''));
        $deliveryAddress = trim((string) ($validated['delivery_address'] ?? ''));

        if (
            $validated['delivery_type'] === 'pickup'
            && $pickupBranch === ''
        ) {
            throw ValidationException::withMessages([
                'pickup_branch' => ['Select pickup branch.'],
            ]);
        }

        if (
            $validated['delivery_type'] === 'delivery'
            && $deliveryAddress === ''
        ) {
            throw ValidationException::withMessages([
                'delivery_address' => ['Enter delivery address.'],
            ]);
        }

        $user = $request->user();
        $paymentMethodId = $validated['payment_method_id'] ?? null;
        $paymentMethodType = $validated['payment_method_type'];

        if ($paymentMethodId !== null) {
            $paymentMethod = $user->paymentMethods()->find($paymentMethodId);

            if (!$paymentMethod) {
                throw ValidationException::withMessages([
                    'payment_method_id' => ['Selected payment method not found.'],
                ]);
            }

            $paymentMethodType = $paymentMethod->method_type;
        }

        $orderItemsPayload = collect($validated['items'])->map(function (array $item): array {
            $unitPrice = (int) $item['unit_price'];
            $quantity = (int) $item['quantity'];
            $lineTotal = $unitPrice * $quantity;

            return [
                'item_name' => $item['name'],
                'item_price' => $unitPrice,
                'quantity' => $quantity,
                'line_total' => $lineTotal,
                'item_image' => $item['image'] ?? null,
            ];
        });

        $itemsCount = (int) $orderItemsPayload->sum('quantity');
        $totalAmount = (int) $orderItemsPayload->sum('line_total');

        $orderNumber = null;

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $candidate = now()->format('ymd').'-'.Str::upper(Str::random(6));

            if (!Order::where('order_number', $candidate)->exists()) {
                $orderNumber = $candidate;
                break;
            }
        }

        if (!$orderNumber) {
            $orderNumber = now()->format('ymd').'-'.Str::upper(Str::random(8));
        }

        $order = DB::transaction(function () use (
            $orderItemsPayload,
            $itemsCount,
            $orderNumber,
            $pickupBranch,
            $deliveryAddress,
            $paymentMethodId,
            $paymentMethodType,
            $totalAmount,
            $user,
            $validated
        ) {
            $newOrder = $user->orders()->create([
                'order_number' => $orderNumber,
                'status' => 'new',
                'delivery_type' => $validated['delivery_type'],
                'pickup_branch' => $validated['delivery_type'] === 'pickup' ? $pickupBranch : null,
                'delivery_address' => $validated['delivery_type'] === 'delivery' ? $deliveryAddress : null,
                'payment_method_type' => $paymentMethodType,
                'payment_method_id' => $paymentMethodId,
                'items_count' => $itemsCount,
                'total_amount' => $totalAmount,
                'currency' => 'RUB',
                'comment' => $validated['comment'] ?? null,
            ]);

            $newOrder->items()->createMany($orderItemsPayload->all());

            return $newOrder;
        });

        $order->load(['items', 'paymentMethod']);

        return response()->json([
            'order' => $serializeOrder($order),
            'message' => 'Order placed successfully.',
        ], 201);
    });
});
