<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\ClaimType;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClaimController extends Controller
{
    public function index(Request $request, Employee $employee)
    {
        $filterMonth = $request->input('claim_month');
        $filterYear = $request->input('claim_year');
        $filterType = $request->input('claim_type_id');

        $claimsQuery = Claim::where('employee_id', $employee->id)
            ->with('claimType')
            ->orderBy('claim_date', 'desc');

        if ($filterMonth) {
            $claimsQuery->whereMonth('claim_date', $filterMonth);
        }

        if ($filterYear) {
            $claimsQuery->whereYear('claim_date', $filterYear);
        }

        if ($filterType) {
            $claimsQuery->where('claim_type_id', $filterType);
        }

        $claims = $claimsQuery->paginate(20)->withQueryString();

        $claimTypes = ClaimType::active()->get();

        // Get available years for filter
        $availableYears = Claim::where('employee_id', $employee->id)
            ->selectRaw('DISTINCT YEAR(claim_date) as year')
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        return Inertia::render('Employees/Manage/Manage', [
            'employee' => $employee->load(['office', 'employmentStatus']),
            'claims' => $claims,
            'claimTypes' => $claimTypes,
            'availableClaimYears' => $availableYears,
            'claimFilters' => [
                'claim_month' => $filterMonth,
                'claim_year' => $filterYear,
                'claim_type_id' => $filterType,
            ],
        ]);
    }

    public function store(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'claim_type_id' => 'required|exists:claim_types,id',
            'claim_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'purpose' => 'required|string',
            'remarks' => 'nullable|string',
        ]);

        $validated['employee_id'] = $employee->id;

        Claim::create($validated);

        return redirect()->back()->with('success', 'Claim recorded successfully');
    }

    public function update(Request $request, Employee $employee, Claim $claim)
    {
        $validated = $request->validate([
            'claim_type_id' => 'required|exists:claim_types,id',
            'claim_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'purpose' => 'required|string',
            'remarks' => 'nullable|string',
        ]);

        $claim->update($validated);

        return redirect()->back()->with('success', 'Claim updated successfully');
    }

    public function destroy(Employee $employee, Claim $claim)
    {
        if ($claim->employee_id !== $employee->id) {
            abort(403, 'Unauthorized action.');
        }

        $claim->delete();

        return redirect()->back()->with('success', 'Claim deleted successfully');
    }
}
