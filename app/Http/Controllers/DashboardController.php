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
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalEmployees = Employee::count();
        $totalOffices = Office::count();
        $totalDeductionTypes = DeductionType::where('is_active', true)->count();

        // Current month stats
        $currentMonth = now()->month;
        $currentYear = now()->year;

        // Total deductions this month
        $monthlyDeductionsCount = EmployeeDeduction::where('pay_period_month', $currentMonth)
            ->where('pay_period_year', $currentYear)
            ->count();

        $monthlyDeductionsTotal = EmployeeDeduction::where('pay_period_month', $currentMonth)
            ->where('pay_period_year', $currentYear)
            ->sum('amount');

        // Employees with deductions this month
        $employeesWithDeductions = EmployeeDeduction::where('pay_period_month', $currentMonth)
            ->where('pay_period_year', $currentYear)
            ->distinct('employee_id')
            ->count('employee_id');

        // Employees by office
        $employeesByOffice = Office::withCount('employees')
            ->orderBy('employees_count', 'desc')
            ->limit(5)
            ->get();

        // Recent employees with their total deductions this month
        $recentEmployeesWithDeductions = Employee::with(['office', 'employmentStatus'])
            ->withSum(['deductions as total_deductions' => function ($query) use ($currentMonth, $currentYear) {
                $query->where('pay_period_month', $currentMonth)
                    ->where('pay_period_year', $currentYear);
            }], 'amount')
            ->whereHas('deductions', function ($query) use ($currentMonth, $currentYear) {
                $query->where('pay_period_month', $currentMonth)
                    ->where('pay_period_year', $currentYear);
            })
            ->latest()
            ->limit(5)
            ->get();

        // Top deduction types this month
        $topDeductionTypes = EmployeeDeduction::where('pay_period_month', $currentMonth)
            ->where('pay_period_year', $currentYear)
            ->selectRaw('deduction_type_id, SUM(amount) as total_amount, COUNT(*) as count')
            ->groupBy('deduction_type_id')
            ->with('deductionType')
            ->orderByDesc('total_amount')
            ->limit(5)
            ->get();

        // Claims stats
        $totalClaims = Claim::whereMonth('claim_date', $currentMonth)
            ->whereYear('claim_date', $currentYear)
            ->count();
        $totalClaimsAmount = Claim::whereMonth('claim_date', $currentMonth)
            ->whereYear('claim_date', $currentYear)
            ->sum('amount');

        // Compensation totals
        $totalSalaries = Salary::sum('amount');
        $totalPera = Pera::sum('amount');
        $totalRata = Rata::sum('amount');

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
