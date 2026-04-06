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

        // Calculate trends
        $lastMonth = now()->subMonth();
        $employeesLastMonth = Employee::whereMonth('created_at', $lastMonth->month)
            ->whereYear('created_at', $lastMonth->year)
            ->count();

        $employeeGrowth = $totalEmployees > 0 && $employeesLastMonth > 0
            ? round((($totalEmployees - $employeesLastMonth) / $employeesLastMonth) * 100, 1)
            : 0;

        // New offices this year
        $officesThisYear = Office::whereYear('created_at', now()->year)->count();

        // New claims this week
        $claimsThisWeek = Claim::where('created_at', '>=', now()->subWeek())->count();

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
            }], 'amount')
            ->whereHas('deductions'); // Only show employees who have at least one deduction

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

        // Highest Travel Claims this month (or all if no filter)
        $travelClaimsQuery = Claim::whereHas('claimType', function ($query) {
            $query->where('code', 'TRAVEL');
        })->with(['employee.office']);

        if ($useFilters) {
            $travelClaimsQuery->whereMonth('claim_date', $currentMonth)
                ->whereYear('claim_date', $currentYear);
        }

        $highestTravelClaims = $travelClaimsQuery->orderByDesc('amount')
            ->limit(5)
            ->get()
            ->map(function ($claim) {
                return [
                    'id' => $claim->id,
                    'employee_name' => $claim->employee->last_name . ', ' . $claim->employee->first_name,
                    'office' => $claim->employee->office?->name ?? 'N/A',
                    'amount' => (float) $claim->amount,
                    'claim_date' => $claim->claim_date,
                    'purpose' => $claim->purpose,
                ];
            });

        // Top Employees by Total Claims Amount this month (or all if no filter)
        $topClaimantsQuery = Claim::query();

        if ($useFilters) {
            $topClaimantsQuery->whereMonth('claim_date', $currentMonth)
                ->whereYear('claim_date', $currentYear);
        }

        $topClaimants = $topClaimantsQuery->selectRaw('employee_id, SUM(amount) as total_amount, COUNT(*) as claim_count')
            ->groupBy('employee_id')
            ->with(['employee.office'])
            ->orderByDesc('total_amount')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'employee_id' => $item->employee_id,
                    'employee_name' => $item->employee->last_name . ', ' . $item->employee->first_name,
                    'office' => $item->employee->office?->name ?? 'N/A',
                    'total_amount' => (float) $item->total_amount,
                    'claim_count' => (int) $item->claim_count,
                ];
            });

        // Top 10 Employees with Most Travel Claims (by count)
        $mostTravelClaimsQuery = Claim::whereHas('claimType', function ($query) {
            $query->where('code', 'TRAVEL');
        })->with(['employee.office']);

        if ($useFilters) {
            $mostTravelClaimsQuery->whereMonth('claim_date', $currentMonth)
                ->whereYear('claim_date', $currentYear);
        }

        $mostTravelClaims = $mostTravelClaimsQuery->selectRaw('employee_id, COUNT(*) as travel_count, SUM(amount) as total_travel_amount')
            ->groupBy('employee_id')
            ->with(['employee.office'])
            ->orderByDesc('travel_count')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'employee_id' => $item->employee_id,
                    'employee_name' => $item->employee->last_name . ', ' . $item->employee->first_name,
                    'office' => $item->employee->office?->name ?? 'N/A',
                    'travel_count' => (int) $item->travel_count,
                    'total_travel_amount' => (float) $item->total_travel_amount,
                ];
            });

        // Top 10 Employees with Most Overtime Claims (by amount)
        $mostOvertimeClaimsQuery = Claim::whereHas('claimType', function ($query) {
            $query->where('code', 'OVERTIME');
        })->with(['employee.office']);

        if ($useFilters) {
            $mostOvertimeClaimsQuery->whereMonth('claim_date', $currentMonth)
                ->whereYear('claim_date', $currentYear);
        }

        $mostOvertimeClaims = $mostOvertimeClaimsQuery->selectRaw('employee_id, COUNT(*) as overtime_count, SUM(amount) as total_overtime_amount')
            ->groupBy('employee_id')
            ->with(['employee.office'])
            ->orderByDesc('total_overtime_amount')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'employee_id' => $item->employee_id,
                    'employee_name' => $item->employee->last_name . ', ' . $item->employee->first_name,
                    'office' => $item->employee->office?->name ?? 'N/A',
                    'overtime_count' => (int) $item->overtime_count,
                    'total_overtime_amount' => (float) $item->total_overtime_amount,
                ];
            });

        // Claims and Overtime by Office
        $claimsByOfficeQuery = Claim::query()
            ->with(['employee.office', 'claimType']);

        if ($useFilters) {
            $claimsByOfficeQuery->whereMonth('claim_date', $currentMonth)
                ->whereYear('claim_date', $currentYear);
        }

        $claimsByOffice = $claimsByOfficeQuery
            ->get()
            ->groupBy(function ($claim) {
                return $claim->employee->office?->id ?? 0;
            })
            ->map(function ($claims, $officeId) {
                $office = $claims->first()->employee->office;

                // Filter travel claims
                $travelClaims = $claims->filter(function ($claim) {
                    return $claim->claimType?->code === 'TRAVEL';
                });

                // Filter overtime claims
                $overtimeClaims = $claims->filter(function ($claim) {
                    return $claim->claimType?->code === 'OVERTIME';
                });

                // Breakdown travel claims by type (meals, transpo, reimbursement, others)
                $travelBreakdown = [
                    'meals' => $travelClaims->filter(function ($claim) {
                        return stripos($claim->purpose, 'meal') !== false ||
                            stripos($claim->purpose, 'food') !== false ||
                            stripos($claim->purpose, 'per diem') !== false;
                    })->sum('amount'),
                    'transportation' => $travelClaims->filter(function ($claim) {
                        return stripos($claim->purpose, 'transpo') !== false ||
                            stripos($claim->purpose, 'transport') !== false ||
                            stripos($claim->purpose, 'fare') !== false ||
                            stripos($claim->purpose, 'gasoline') !== false ||
                            stripos($claim->purpose, 'fuel') !== false;
                    })->sum('amount'),
                    'reimbursement' => $travelClaims->filter(function ($claim) {
                        return stripos($claim->purpose, 'reimburse') !== false ||
                            stripos($claim->purpose, 'refund') !== false;
                    })->sum('amount'),
                    'others' => $travelClaims->filter(function ($claim) {
                        $purpose = strtolower($claim->purpose);
                        return !stripos($purpose, 'meal') &&
                            !stripos($purpose, 'food') &&
                            !stripos($purpose, 'per diem') &&
                            !stripos($purpose, 'transpo') &&
                            !stripos($purpose, 'transport') &&
                            !stripos($purpose, 'fare') &&
                            !stripos($purpose, 'gasoline') &&
                            !stripos($purpose, 'fuel') &&
                            !stripos($purpose, 'reimburse') &&
                            !stripos($purpose, 'refund');
                    })->sum('amount'),
                ];

                return [
                    'office_name' => $office?->name ?? 'Unknown',
                    'office_code' => $office?->code ?? 'N/A',
                    'travel_count' => (int) $travelClaims->count(),
                    'travel_total' => (float) $travelClaims->sum('amount'),
                    'travel_breakdown' => [
                        'meals' => (float) $travelBreakdown['meals'],
                        'transportation' => (float) $travelBreakdown['transportation'],
                        'reimbursement' => (float) $travelBreakdown['reimbursement'],
                        'others' => (float) $travelBreakdown['others'],
                    ],
                    'overtime_count' => (int) $overtimeClaims->count(),
                    'overtime_total' => (float) $overtimeClaims->sum('amount'),
                ];
            })
            ->values()
            ->sortByDesc('travel_total')
            ->values();

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
                // Trend data
                'employeeGrowth' => $employeeGrowth,
                'officesThisYear' => $officesThisYear,
                'claimsThisWeek' => $claimsThisWeek,
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
            'highestTravelClaims' => $highestTravelClaims,
            'topClaimants' => $topClaimants,
            'mostTravelClaims' => $mostTravelClaims,
            'mostOvertimeClaims' => $mostOvertimeClaims,
            'claimsByOffice' => $claimsByOffice,
        ]);
    }
}
