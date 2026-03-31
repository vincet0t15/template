<?php

namespace App\Http\Controllers;

use App\Models\SourceOfFundCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SourceOfFundCodeController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('SourceOfFundCode/index');
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:255|unique:source_of_fund_codes',
            'description' => 'string|max:255|nullable',
            'status' => 'boolean',
        ]);

        SourceOfFundCode::create([
            'code' => $request->code,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        return redirect()->back()->with('success', 'Source of fund code created successfully.');
    }
}
