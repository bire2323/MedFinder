<?php

namespace App\Http\Controllers;

// In InventoryController.php
use App\Http\Controllers\Controller;
use App\Models\Drug;
use App\Models\Pharmacy;
use App\Models\PharmacyDrugInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; 
use Illuminate\Support\Facades\Log;

class PharmacyDrugInventoryController extends Controller
{
    public function getInventory()
    {
        $pharmacy = Auth::user()->pharmacies; 
       
        $pharmacydata = Pharmacy::with('drugs')->find($pharmacy->id);

        return response()->json(['success' => true, 'data' => $pharmacydata]);
    }

    public function addDrug(Request $request)
    {
        $validated = $request->validate([
            'brand_name_en' => 'required|string|max:255',
            'brand_name_am' => 'nullable|string|max:255',
            'genericName' => 'required|string|max:255',
            'about_drug_en' => 'required|string',
            'about_drug_am' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'price' => 'numeric|min:0',
            'expiryDate' => 'date',
            'rx_required' => 'boolean',
        ]);

        $pharmacy = Auth::user()->pharmacies;

        // Check if drug exists, create if not
        $drug = Drug::Create([
            'generic_name' => $validated['genericName'],
             'brand_name_en' => $validated['brand_name_en'],
             'brand_name_am' => $validated['brand_name_am'],
        ]);

        // Add to inventory
        $inventory = PharmacyDrugInventory::create([
            'drug_id' => $drug->id,
            'pharmacy_id' => $pharmacy->id,
            'stock' => $validated['stock'],
            'price' => $validated['price'] ?? null,
            "about_drug_en"=>$validated['about_drug_en'],
            "about_drug_am"=>$validated['about_drug_am'] ?? null,
            'expire_date' => $validated['expiryDate'],
            'rx_required' => $validated['rx_required'] ?? false,
        ]);

        return response()->json(['success' => true, 'data' => $inventory]);
    }

    public function update($id, Request $request)
    {
        $validated = $request->validate([
            'brand_name_en' => 'required|string|max:255',
            'brand_name_am' => 'nullable|string|max:255',
            'genericName' => 'required|string|max:255',
            'about_drug_en' => 'required|string',
            'about_drug_am' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'price' => 'numeric|min:0',
            'expire_date' => 'date',
            'rx_required' => 'boolean',
        ]);

        $pharmacy = Auth::user()->pharmacies;
        $inventory = PharmacyDrugInventory::where('id', $id)
            ->where('pharmacy_id', $pharmacy->id)
            ->firstOrFail();

        $drug = Drug::where('id',$inventory->drug_id)->firstOrFail();
        $drug->update([
            'brand_name_en' => $validated['brand_name_en'],
            'brand_name_am' => $validated['brand_name_am'],
            'generic_name' => $validated['genericName'],
          
        ]);

        $inventory->update([
            'about_drug_en'=>$validated['about_drug_en'],
            'about_drug_am'=>$validated['about_drug_am'] ?? $inventory->about_drug_am,
            'stock' => $validated['stock'],
            'price' => $validated['price'] ?? $inventory->price,
            'expiry_date' => $validated['expiry_date'] ?? $inventory->expiry_date,
            'rx_required' => $validated['rx_required'] ?? $inventory->rx_required,
        ]);

        return response()->json(['success' => true]);
    }

  public function deleteDrug(Request $request, $id)
{
    $inventory = PharmacyDrugInventory::find($id);  

    $drug_id=$inventory->drug_id;
    if (!$inventory) {
        return response()->json([
            'success' => false,
            'message' => 'Inventory item not found or already deleted',
        ], 404);
    }

    // Optional: ownership check (very important!)
    if ($inventory->pharmacy_id !== auth()->user()->pharmacies->id) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized action',
        ], 403);
    }
    $inventory->delete();
    $drug=Drug::findorfail($drug_id);
    $drug->delete();

    return response()->json([
        'success' => true,
        'message' => 'Inventory deleted successfully',
    ], 200);
}
}