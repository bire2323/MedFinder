<?php

namespace App\Http\Controllers;

use App\Models\Drug;
use Illuminate\Http\Request;

class DrugController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Drug $drug)
    {
        $data=$drug;
       return response()->json(['success'=>true,'data'=>$data]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Drug $drug)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Drug $drug)
    {
        //
    }
}
