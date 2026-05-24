<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Faq extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'faqs';

    protected $fillable = [
        'category',
        'question_en',
        'question_am',
        'answer_en',
        'answer_am',
        'is_active',
        'role_target',
        'tags',
        'order_priority',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'role_target' => 'array',
    ];
}
