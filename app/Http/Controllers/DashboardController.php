<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\DeductionType;
use App\Models\Employee;
use App\Models\EmployeeDeduction;
use App\Models\Office;
use App\Models\Pera;
use App\Models\Rata;
use App\Models\Salary;
use App\Models\SourceOfFundCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Get month and year from request, default to current
        // If empty, fetch all data
        $month = $request->input('month');
        $year = $request->input('year');

        // Use defaults only if both are provided
        $useFilters = ! empty($month) && ! empty($year);

        if (! $useFilters) {
            $month = now()->month;
            $year = now()->year;
        }

        $totalEmployees = Employee::count();
        $totalOffices = Office::count();
        $totalDeductionTypes = DeductionType::where('is_active', true)->count();

        // Current month stats
        $currentMonth = $month;
        $currentYear = $year;

        // Total deductions this month (or all if no filter)
        $monthlyDeductionsQuery = EmployeeDeduction::query();
        if ($useFilters) {
            $monthlyDeductionsQuery->where('pay_period_month', $currentMonth)
                ->where('pay_period_year', $currentYear);
        }
        $monthlyDeductionsCount = $monthlyDeductionsQuery->count();

        $monthlyDeductionsTotal = $monthlyDeductionsQuery->sum('amount');

        // Employees with deductions this month (or all if no filter)
        $employeesWithDeductionsQuery = EmployeeDeduction::query();
        if ($useFilters) {
            $employeesWithDeductionsQuery->where('pay_period_month', $currentMonth)
                ->where('pay_period_year', $currentYear);
        }
        $employeesWithDeductions = $employeesWithDeductionsQuery->distinct('employee_id')
            ->count('employee_id');

        // Employees by office
        $employeesByOffice = Office::withCount('employees')
            ->orderBy('employees_count', 'desc')
            ->limit(5)
            ->get();

        // Recent employees with their total deductions this month (or all if no filter)
        $recentEmployeesQuery = Employee::with(['office', 'employmentStatus'])
            ->withSum(['deductions as total_deductions' => function ($query) use ($currentMonth, $currentYear, $useFilters) {
                if ($useFilters) {
                    $query->where('pay_period_month', $currentMonth)
                        ->where('pay_period_year', $currentYear);
                }
            }], 'amount');

        if ($useFilters) {
            $recentEmployeesQuery->whereHas('deductions', function ($query) use ($currentMonth, $currentYear) {
                $query->where('pay_period_month', $currentMonth)
                    ->where('pay_period_year', $currentYear);
            });
        }

        $recentEmployeesWithDeductions = $recentEmployeesQuery
            ->latest()
            ->limit(5)
            ->get();

        // Top deduction types this month (or all if no filter)
        $topDeductionTypesQuery = EmployeeDeduction::query();
        if ($useFilters) {
            $topDeductionTypesQuery->where('pay_period_month', $currentMonth)
                ->where('pay_period_year', $currentYear);
        }
        $topDeductionTypes = $topDeductionTypesQuery
            ->selectRaw('deduction_type_id, SUM(amount) as total_amount, COUNT(*) as count')
            ->groupBy('deduction_type_id')
            ->with('deductionType')
            ->orderByDesc('total_amount')
            ->limit(5)
            ->get();

        // Claims stats (or all if no filter)
        $claimsQuery = Claim::query();
        if ($useFilters) {
            $claimsQuery->whereMonth('claim_date', $currentMonth)
                ->whereYear('claim_date', $currentYear);
        }
        $totalClaims = $claimsQuery->count();
        $totalClaimsAmount = $claimsQuery->sum('amount');

        // Compensation totals (current year only)
        $totalSalaries = Salary::whereYear('effective_date', $currentYear)->sum('amount');
        $totalPera = Pera::whereYear('effective_date', $currentYear)->sum('amount');
        $totalRata = Rata::whereYear('effective_date', $currentYear)->sum('amount');

        // Source of Fund breakdown for selected month/year (or all if no filter)
        $allSourceOfFundCodes = SourceOfFundCode::where('status', true)
            ->orderBy('code')
            ->get();

        $salariesQuery = Salary::selectRaw('source_of_fund_code_id, SUM(amount) as total_amount');

        if ($useFilters) {
            $salariesQuery->whereYear('effective_date', $year);
            if ($month) {
                $salariesQuery->whereMonth('effective_date', $month);
            }
        }

        $salariesBySourceOfFund = $salariesQuery
            ->groupBy('source_of_fund_code_id')
            ->with('sourceOfFundCode')
            ->get()
            ->map(function ($item) {
                return [
                    'source_of_fund_code_id' => $item->source_of_fund_code_id,
                    'code' => $item->sourceOfFundCode?->code ?? 'Unfunded',
                    'description' => $item->sourceOfFundCode?->description,
                    'total_amount' => (float) $item->total_amount,
                ];
            });

        // Merge with all funds to include those with 0 amounts
        $salariesBySourceOfFund = $allSourceOfFundCodes->map(function ($fund) use ($salariesBySourceOfFund) {
            $existing = $salariesBySourceOfFund->firstWhere('source_of_fund_code_id', $fund->id);

            if ($existing) {
                return [
                    'id' => $fund->id,
                    'code' => $existing['code'],
                    'description' => $existing['description'],
                    'total_amount' => $existing['total_amount'],
                ];
            }

            // Return fund with 0 amount
            return [
                'id' => $fund->id,
                'code' => $fund->code,
                'description' => $fund->description,
                'total_amount' => 0.0,
            ];
        })->values();

        // Recent activity (placeholder - can be enhanced with actual activity log)
        $recentActivity = [];

        return Inertia::render('dashboard', [
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'totalOffices' => $totalOffices,
                'totalDeductionTypes' => $totalDeductionTypes,
                'monthlyDeductionsCount' => $monthlyDeductionsCount,
                'monthlyDeductionsTotal' => (float) $monthlyDeductionsTotal,
                'employeesWithDeductions' => $employeesWithDeductions,
                'totalClaims' => $totalClaims,
                'totalClaimsAmount' => (float) $totalClaimsAmount,
                'totalSalaries' => (float) $totalSalaries,
                'totalPera' => (float) $totalPera,
                'totalRata' => (float) $totalRata,
            ],
            'salariesBySourceOfFund' => $salariesBySourceOfFund,
            'filters' => [
                'month' => (int) $month,
                'year' => (int) $year,
            ],
            'employeesByOffice' => $employeesByOffice,
            'recentEmployeesWithDeductions' => $recentEmployeesWithDeductions,
            'topDeductionTypes' => $topDeductionTypes,
            'currentPeriod' => [
                'month' => $currentMonth,
                'year' => $currentYear,
                'monthName' => now()->format('F'),
            ],
            'recentActivity' => $recentActivity,
        ]);
    }
}
