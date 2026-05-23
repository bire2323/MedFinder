<?php

namespace App\Http\Controllers;

use App\Models\Drug;
use App\Models\DrugPurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Repositories\InventoryRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DrugPurchaseOrderController extends Controller
{
    public function __construct(
        protected InventoryRepository $inventory
    ) {}

    protected function pharmacy()
    {
        $pharmacy = Auth::user()->pharmacy;
        if (!$pharmacy) {
            abort(404, 'Pharmacy not found');
        }

        return $pharmacy;
    }

    public function index(Request $request)
    {
        $pharmacy = $this->pharmacy();

        $orders = DrugPurchaseOrder::where('pharmacy_id', $pharmacy->id)
            ->with('items.drug')
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
            'expected_delivery_at' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.drug_id' => 'required|exists:drugs,id',
            'items.*.quantity_ordered' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.expected_batch_number' => 'nullable|string',
            'items.*.expected_expiration_date' => 'nullable|date',
        ]);

        $pharmacy = $this->pharmacy();

        return DB::transaction(function () use ($validated, $pharmacy) {
            $poNumber = 'PO-' . strtoupper(uniqid());

            $order = DrugPurchaseOrder::create([
                'po_number' => $poNumber,
                'pharmacy_id' => $pharmacy->id,
                'status' => 'DRAFT',
                'notes' => $validated['notes'] ?? null,
                'expected_delivery_at' => $validated['expected_delivery_at'] ?? null,
                'created_by' => Auth::id(),
            ]);

            $total = 0;

            foreach ($validated['items'] as $item) {
                $lineTotal = $item['quantity_ordered'] * $item['unit_price'];
                $total += $lineTotal;

                PurchaseOrderItem::create([
                    'purchase_order_id' => $order->id,
                    'drug_id' => $item['drug_id'],
                    'quantity_ordered' => $item['quantity_ordered'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $lineTotal,
                    'expected_batch_number' => $item['expected_batch_number'] ?? null,
                    'expected_expiration_date' => $item['expected_expiration_date'] ?? null,
                ]);
            }

            $order->update(['total_amount' => $total]);

            return response()->json([
                'success' => true,
                'data' => $order->load('items.drug'),
            ], 201);
        });
    }

    public function show(int $id)
    {
        $pharmacy = $this->pharmacy();

        $order = DrugPurchaseOrder::where('pharmacy_id', $pharmacy->id)
            ->with(['items.drug', 'items.drugBatch'])
            ->findOrFail($id);

        return response()->json(['success' => true, 'data' => $order]);
    }

    public function receive(Request $request, int $id)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:purchase_order_items,id',
            'items.*.quantity_received' => 'required|integer|min:0',
            'items.*.batch_number' => 'required|string',
            'items.*.expiration_date' => 'required|date',
            'items.*.manufacture_date' => 'nullable|date',
            'items.*.manufacturer' => 'nullable|string',
            'items.*.selling_price' => 'required|numeric|min:0',
        ]);

        $pharmacy = $this->pharmacy();
        $order = DrugPurchaseOrder::where('pharmacy_id', $pharmacy->id)->findOrFail($id);

        return DB::transaction(function () use ($validated, $pharmacy, $order) {
            foreach ($validated['items'] as $received) {
                $item = PurchaseOrderItem::where('purchase_order_id', $order->id)
                    ->findOrFail($received['item_id']);

                if ($received['quantity_received'] <= 0) {
                    continue;
                }

                $drug = Drug::findOrFail($item->drug_id);

                $batch = $this->inventory->findOrCreateBatch($drug, [
                    'batch_number' => $received['batch_number'],
                    'manufacture_date' => $received['manufacture_date'] ?? null,
                    'expiration_date' => $received['expiration_date'],
                    'manufacturer' => $received['manufacturer'] ?? null,
                ]);

                $this->inventory->addStockFromReceipt(
                    $pharmacy,
                    $batch,
                    $received['quantity_received'],
                    (float) $item->unit_price,
                    (float) $received['selling_price'],
                    Auth::user(),
                    'purchase_order_item',
                    $item->id
                );

                $item->update([
                    'drug_batch_id' => $batch->id,
                    'quantity_received' => $item->quantity_received + $received['quantity_received'],
                    'status' => $item->quantity_received >= $item->quantity_ordered ? 'RECEIVED' : 'PARTIALLY_RECEIVED',
                ]);
            }

            $allReceived = $order->items()->where('status', '!=', 'RECEIVED')->doesntExist();
            $order->update([
                'status' => $allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED',
                'received_at' => $allReceived ? now() : $order->received_at,
            ]);

            return response()->json([
                'success' => true,
                'data' => $order->fresh(['items.drug', 'items.drugBatch']),
            ]);
        });
    }
}
