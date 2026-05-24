<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index(Request $request)
    {
        $faqs = Faq::query()
            ->where('is_active', true)
            ->orderBy('order_priority')
            ->get(['id', 'category', 'question_en', 'question_am', 'answer_en', 'answer_am']);

        return response()->json([
            'success' => true,
            'data' => $faqs,
        ]);
    }
}
