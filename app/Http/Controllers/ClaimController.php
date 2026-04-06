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

    /**
     * Display claims report page with all employees and their claims
     */
    public function report(Request $request)
    {
        $filterMonth = $request->input('month');
        $filterYear = $request->input('year', now()->year);
        $filterType = $request->input('type'); // 'travel', 'overtime', or null for all

        // Build query for employees with claims
        $employeesQuery = Employee::with(['office'])
            ->whereHas('claims');

        // Apply filters
        if ($filterMonth) {
            $employeesQuery->whereHas('claims', function ($query) use ($filterMonth, $filterYear) {
                $query->whereMonth('claim_date', $filterMonth)
                    ->whereYear('claim_date', $filterYear);
            });
        } else {
            $employeesQuery->whereHas('claims', function ($query) use ($filterYear) {
                $query->whereYear('claim_date', $filterYear);
            });
        }

        // Filter by claim type if specified
        if ($filterType === 'travel') {
            $employeesQuery->whereHas('claims', function ($query) {
                $query->whereHas('claimType', function ($q) {
                    $q->where('code', 'TRAVEL');
                });
            });
        } elseif ($filterType === 'overtime') {
            $employeesQuery->whereHas('claims', function ($query) {
                $query->whereHas('claimType', function ($q) {
                    $q->where('code', 'OVERTIME');
                });
            });
        }

        $employees = $employeesQuery->get()->map(function ($employee) use ($filterMonth, $filterYear, $filterType) {
            // Build claims query for this employee
            $claimsQuery = $employee->claims()
                ->with('claimType')
                ->orderBy('claim_date', 'desc');

            if ($filterMonth) {
                $claimsQuery->whereMonth('claim_date', $filterMonth)
                    ->whereYear('claim_date', $filterYear);
            } else {
                $claimsQuery->whereYear('claim_date', $filterYear);
            }

            // Filter by type if specified
            if ($filterType === 'travel') {
                $claimsQuery->whereHas('claimType', function ($q) {
                    $q->where('code', 'TRAVEL');
                });
            } elseif ($filterType === 'overtime') {
                $claimsQuery->whereHas('claimType', function ($q) {
                    $q->where('code', 'OVERTIME');
                });
            }

            $claims = $claimsQuery->get();

            return [
                'id' => $employee->id,
                'name' => $employee->last_name . ', ' . $employee->first_name,
                'office' => $employee->office?->name ?? 'N/A',
                'total_amount' => $claims->sum('amount'),
                'claim_count' => $claims->count(),
                'travel_count' => $claims->where('claimType.code', 'TRAVEL')->count(),
                'travel_amount' => $claims->where('claimType.code', 'TRAVEL')->sum('amount'),
                'overtime_count' => $claims->where('claimType.code', 'OVERTIME')->count(),
                'overtime_amount' => $claims->where('claimType.code', 'OVERTIME')->sum('amount'),
                'other_count' => $claims->whereNotIn('claimType.code', ['TRAVEL', 'OVERTIME'])->count(),
                'other_amount' => $claims->whereNotIn('claimType.code', ['TRAVEL', 'OVERTIME'])->sum('amount'),
            ];
        })->sortByDesc('total_amount')->values();

        // Get summary statistics
        $summary = [
            'total_employees' => $employees->count(),
            'total_claims' => $employees->sum('claim_count'),
            'total_amount' => $employees->sum('total_amount'),
            'total_travel_claims' => $employees->sum('travel_count'),
            'total_travel_amount' => $employees->sum('travel_amount'),
            'total_overtime_claims' => $employees->sum('overtime_count'),
            'total_overtime_amount' => $employees->sum('overtime_amount'),
        ];

        return Inertia::render('Claims/Report', [
            'employees' => $employees,
            'summary' => $summary,
            'filters' => [
                'month' => $filterMonth,
                'year' => $filterYear,
                'type' => $filterType,
            ],
        ]);
    }

    /**
     * Print-friendly version of claims report
     */
    public function reportPrint(Request $request)
    {
        $filterMonth = $request->input('month');
        $filterYear = $request->input('year', now()->year);
        $filterType = $request->input('type');

        // Same logic as report() method
        $employeesQuery = Employee::with(['office'])
            ->whereHas('claims');

        if ($filterMonth) {
            $employeesQuery->whereHas('claims', function ($query) use ($filterMonth, $filterYear) {
                $query->whereMonth('claim_date', $filterMonth)
                    ->whereYear('claim_date', $filterYear);
            });
        } else {
            $employeesQuery->whereHas('claims', function ($query) use ($filterYear) {
                $query->whereYear('claim_date', $filterYear);
            });
        }

        if ($filterType === 'travel') {
            $employeesQuery->whereHas('claims', function ($query) {
                $query->whereHas('claimType', function ($q) {
                    $q->where('code', 'TRAVEL');
                });
            });
        } elseif ($filterType === 'overtime') {
            $employeesQuery->whereHas('claims', function ($query) {
                $query->whereHas('claimType', function ($q) {
                    $q->where('code', 'OVERTIME');
                });
            });
        }

        $employees = $employeesQuery->get()->map(function ($employee) use ($filterMonth, $filterYear, $filterType) {
            $claimsQuery = $employee->claims()
                ->with('claimType')
                ->orderBy('claim_date', 'desc');

            if ($filterMonth) {
                $claimsQuery->whereMonth('claim_date', $filterMonth)
                    ->whereYear('claim_date', $filterYear);
            } else {
                $claimsQuery->whereYear('claim_date', $filterYear);
            }

            if ($filterType === 'travel') {
                $claimsQuery->whereHas('claimType', function ($q) {
                    $q->where('code', 'TRAVEL');
                });
            } elseif ($filterType === 'overtime') {
                $claimsQuery->whereHas('claimType', function ($q) {
                    $q->where('code', 'OVERTIME');
                });
            }

            $claims = $claimsQuery->get();

            return [
                'id' => $employee->id,
                'name' => $employee->last_name . ', ' . $employee->first_name,
                'office' => $employee->office?->name ?? 'N/A',
                'total_amount' => $claims->sum('amount'),
                'claim_count' => $claims->count(),
                'travel_count' => $claims->where('claimType.code', 'TRAVEL')->count(),
                'travel_amount' => $claims->where('claimType.code', 'TRAVEL')->sum('amount'),
                'overtime_count' => $claims->where('claimType.code', 'OVERTIME')->count(),
                'overtime_amount' => $claims->where('claimType.code', 'OVERTIME')->sum('amount'),
                'other_count' => $claims->whereNotIn('claimType.code', ['TRAVEL', 'OVERTIME'])->count(),
                'other_amount' => $claims->whereNotIn('claimType.code', ['TRAVEL', 'OVERTIME'])->sum('amount'),
            ];
        })->sortByDesc('total_amount')->values();

        $summary = [
            'total_employees' => $employees->count(),
            'total_claims' => $employees->sum('claim_count'),
            'total_amount' => $employees->sum('total_amount'),
            'total_travel_claims' => $employees->sum('travel_count'),
            'total_travel_amount' => $employees->sum('travel_amount'),
            'total_overtime_claims' => $employees->sum('overtime_count'),
            'total_overtime_amount' => $employees->sum('overtime_amount'),
        ];

        return Inertia::render('Claims/ReportPrint', [
            'employees' => $employees,
            'summary' => $summary,
            'filters' => [
                'month' => $filterMonth,
                'year' => $filterYear,
                'type' => $filterType,
            ],
        ]);
    }
}
