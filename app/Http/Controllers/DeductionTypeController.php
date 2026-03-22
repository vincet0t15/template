<?php

namespace App\Http\Controllers;

use App\Models\DeductionType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeductionTypeController extends Controller
{
    public function index()
    {
        $deductionTypes = DeductionType::orderBy('name', 'asc')->get();

        return Inertia::render('deduction-types/index', [
            'deductionTypes' => $deductionTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:deduction_types,code',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        DeductionType::create($validated);

        return redirect()->back()->with('success', 'Deduction type created successfully');
    }

    public function update(Request $request, DeductionType $deductionType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:deduction_types,code,' . $deductionType->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $deductionType->update($validated);

        return redirect()->back()->with('success', 'Deduction type updated successfully');
    }

    public function destroy(DeductionType $deductionType)
    {
        $deductionType->delete();

        return redirect()->back()->with('success', 'Deduction type deleted successfully');
    }
}
