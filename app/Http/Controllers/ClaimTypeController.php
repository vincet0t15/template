<?php

namespace App\Http\Controllers;

use App\Models\ClaimType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClaimTypeController extends Controller
{
    public function index()
    {
        $claimTypes = ClaimType::orderBy('name')->get();

        return Inertia::render('ClaimTypes/Index', [
            'claimTypes' => $claimTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:claim_types,code',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        ClaimType::create($validated);

        return redirect()->back()->with('success', 'Claim type created successfully');
    }

    public function update(Request $request, ClaimType $claimType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:claim_types,code,' . $claimType->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $claimType->update($validated);

        return redirect()->back()->with('success', 'Claim type updated successfully');
    }

    public function destroy(ClaimType $claimType)
    {
        if ($claimType->claims()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete claim type with existing claims');
        }

        $claimType->delete();

        return redirect()->back()->with('success', 'Claim type deleted successfully');
    }
}
