<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index(Request $request)
    {
        $query = Faq::query()->where('is_active', true);
        if ($request->filled('search')) {
            $term = $request->input('search');
            $query->where(function ($q) use ($term) {
                $q->where('category', 'like', "%{$term}%")
                    ->orWhere('question_en', 'like', "%{$term}%")
                    ->orWhere('answer_en', 'like', "%{$term}%")
                    ->orWhere('question_am', 'like', "%{$term}%")
                    ->orWhere('answer_am', 'like', "%{$term}%");
            });
        }

        $faqs = $query->orderBy('order_priority')->get([
            'id',
            'category',
            'question_en',
            'question_am',
            'answer_en',
            'answer_am',
        ]);

        return response()->json([
            'success' => true,
            'data' => $faqs,
        ]);
    }

    public function adminIndex(Request $request)
    {
        $query = Faq::query();

        if ($request->filled('search')) {
            $term = $request->input('search');
            $query->where(function ($q) use ($term) {
                $q->where('category', 'like', "%{$term}%")
                    ->orWhere('question_en', 'like', "%{$term}%")
                    ->orWhere('answer_en', 'like', "%{$term}%")
                    ->orWhere('question_am', 'like', "%{$term}%")
                    ->orWhere('answer_am', 'like', "%{$term}%");
            });
        }

        $faqs = $query->orderBy('order_priority')->get([
            'id',
            'category',
            'question_en',
            'question_am',
            'answer_en',
            'answer_am',
            'is_active',
            'order_priority',
        ]);

        return response()->json([
            'success' => true,
            'data' => $faqs,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category' => 'required|string|max:255',
            'question_en' => 'required|string',
            'question_am' => 'nullable|string',
            'answer_en' => 'required|string',
            'answer_am' => 'nullable|string',
            'order_priority' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $faq = Faq::create(array_merge($data, [
            'order_priority' => $data['order_priority'] ?? 1,
            'is_active' => $data['is_active'] ?? true,
        ]));

        return response()->json([
            'success' => true,
            'data' => $faq,
        ], 201);
    }

    public function update(Request $request, Faq $faq)
    {
        $data = $request->validate([
            'category' => 'required|string|max:255',
            'question_en' => 'required|string',
            'question_am' => 'nullable|string',
            'answer_en' => 'required|string',
            'answer_am' => 'nullable|string',
            'order_priority' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $faq->update(array_merge($data, [
            'order_priority' => $data['order_priority'] ?? $faq->order_priority,
            'is_active' => $data['is_active'] ?? $faq->is_active,
        ]));

        return response()->json([
            'success' => true,
            'data' => $faq,
        ]);
    }

    public function destroy(Faq $faq)
    {
        $faq->delete();

        return response()->json([
            'success' => true,
            'message' => 'FAQ deleted successfully',
        ]);
    }
}
