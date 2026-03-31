<?php

namespace App\Http\Controllers;

use App\Models\SourceOfFundCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SourceOfFundCodeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $sourceOfFundCodes = SourceOfFundCode::query()
            ->when($search, function ($query, $search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('code')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('SourceOfFundCode/index', [
            'sourceOfFundCodes' => $sourceOfFundCodes,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:255|unique:source_of_fund_codes,code',
            'description' => 'nullable|string|max:255',
            'status' => 'boolean',
        ]);

        SourceOfFundCode::create($validated);

        return redirect()->back()->with('success', 'Source of fund code created successfully.');
    }

    public function update(Request $request, SourceOfFundCode $sourceOfFundCode)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:255|unique:source_of_fund_codes,code,' . $sourceOfFundCode->id,
            'description' => 'nullable|string|max:255',
            'status' => 'boolean',
        ]);

        $sourceOfFundCode->update($validated);

        return redirect()->back()->with('success', 'Source of fund code updated successfully.');
    }

    public function destroy(SourceOfFundCode $sourceOfFundCode)
    {
        $sourceOfFundCode->delete();

        return redirect()->back()->with('success', 'Source of fund code deleted successfully.');
    }
}
