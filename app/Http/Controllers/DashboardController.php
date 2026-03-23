<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeDeduction;
use App\Models\Office;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalEmployees = Employee::count();
        $totalOffices = Office::count();

        // Employees by office
        $employeesByOffice = Office::withCount('employees')
            ->orderBy('employees_count', 'desc')
            ->limit(5)
            ->get();

        // Recent employees (last 5)
        $recentEmployees = Employee::with(['office', 'employmentStatus'])
            ->latest()
            ->limit(5)
            ->get();

        // Current month stats
        $currentMonth = now()->month;
        $currentYear = now()->year;

        $monthlyDeductions = EmployeeDeduction::where('pay_period_month', $currentMonth)
            ->where('pay_period_year', $currentYear)
            ->sum('amount');

        // Employees with deductions this month
        $employeesWithDeductions = EmployeeDeduction::where('pay_period_month', $currentMonth)
            ->where('pay_period_year', $currentYear)
            ->distinct('employee_id')
            ->count('employee_id');

        // RATA eligible count
        $rataEligibleCount = Employee::where('is_rata_eligible', true)->count();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'totalOffices' => $totalOffices,
                'monthlyDeductions' => (float) $monthlyDeductions,
                'employeesWithDeductions' => $employeesWithDeductions,
                'rataEligibleCount' => $rataEligibleCount,
            ],
            'employeesByOffice' => $employeesByOffice,
            'recentEmployees' => $recentEmployees,
        ]);
    }
}
