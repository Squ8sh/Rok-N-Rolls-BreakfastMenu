<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'delivery_type',
        'pickup_branch',
        'delivery_address',
        'payment_method_type',
        'payment_method_id',
        'items_count',
        'total_amount',
        'currency',
        'comment',
    ];

    protected $casts = [
        'items_count' => 'integer',
        'total_amount' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
