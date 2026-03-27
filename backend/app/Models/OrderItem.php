<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'item_name',
        'item_price',
        'quantity',
        'line_total',
        'item_image',
    ];

    protected $casts = [
        'item_price' => 'integer',
        'quantity' => 'integer',
        'line_total' => 'integer',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
