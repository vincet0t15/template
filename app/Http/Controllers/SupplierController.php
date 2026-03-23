<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers.
     */
    public function index(): Response
    {
        $suppliers = Supplier::orderBy('pr_date', 'desc')->get();

        return Inertia::render('suppliers/index', [
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Store a newly created supplier.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pr_date' => 'required|date',
            'pr_no' => 'required|string|max:255',
            'po_date' => 'nullable|date',
            'po_no' => 'nullable|string|max:255',
            'sale_invoice_date' => 'nullable|date',
            'sale_invoice_no' => 'nullable|string|max:255',
            'or_date' => 'nullable|date',
            'or_no' => 'nullable|string|max:255',
            'dr_date' => 'nullable|date',
            'dr_no' => 'nullable|string|max:255',
            'qty_period_covered' => 'nullable|string|max:255',
            'particulars' => 'required|string',
            'gross' => 'required|numeric|min:0',
            'ewt' => 'nullable|numeric|min:0',
            'vat' => 'nullable|numeric|min:0',
            'net_amount' => 'required|numeric|min:0',
            'date_processed' => 'nullable|date',
            'remarks' => 'nullable|string',
        ]);

        Supplier::create($validated);

        return redirect()->route('suppliers.index')->with('success', 'Supplier record created successfully.');
    }

    /**
     * Update the specified supplier.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'pr_date' => 'required|date',
            'pr_no' => 'required|string|max:255',
            'po_date' => 'nullable|date',
            'po_no' => 'nullable|string|max:255',
            'sale_invoice_date' => 'nullable|date',
            'sale_invoice_no' => 'nullable|string|max:255',
            'or_date' => 'nullable|date',
            'or_no' => 'nullable|string|max:255',
            'dr_date' => 'nullable|date',
            'dr_no' => 'nullable|string|max:255',
            'qty_period_covered' => 'nullable|string|max:255',
            'particulars' => 'required|string',
            'gross' => 'required|numeric|min:0',
            'ewt' => 'nullable|numeric|min:0',
            'vat' => 'nullable|numeric|min:0',
            'net_amount' => 'required|numeric|min:0',
            'date_processed' => 'nullable|date',
            'remarks' => 'nullable|string',
        ]);

        $supplier->update($validated);

        return redirect()->route('suppliers.index')->with('success', 'Supplier record updated successfully.');
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return redirect()->route('suppliers.index')->with('success', 'Supplier record deleted successfully.');
    }
}
