<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('order_number', 32)->unique();
            $table->string('status', 32)->default('new');
            $table->string('delivery_type', 20);
            $table->string('pickup_branch', 120)->nullable();
            $table->string('delivery_address', 255)->nullable();
            $table->string('payment_method_type', 20);
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->nullOnDelete();
            $table->unsignedInteger('items_count');
            $table->unsignedInteger('total_amount');
            $table->string('currency', 3)->default('RUB');
            $table->string('comment', 500)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
