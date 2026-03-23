<?php

namespace App\Http\Controllers;

use App\Models\DeductionType;
use App\Models\Employee;
use App\Models\Office;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        $officeId = $request->input('office_id');
        $search = $request->input('search');

        $employees = Employee::query()
            ->with(['employmentStatus', 'office'])
            ->when($search, function ($query, $search) {
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            })
            ->when($officeId, function ($query, $officeId) {
                $query->where('office_id', $officeId);
            })
            ->with(['salaries' => function ($query) {
                $query->latest('effective_date')->limit(1);
            }])
            ->with(['peras' => function ($query) {
                $query->latest('effective_date')->limit(1);
            }])
            ->with(['ratas' => function ($query) {
                $query->latest('effective_date')->limit(1);
            }])
            ->with(['deductions' => function ($query) use ($month, $year) {
                $query->where('pay_period_month', $month)
                    ->where('pay_period_year', $year)
                    ->with('deductionType');
            }])
            ->orderBy('last_name', 'asc')
            ->paginate(50)
            ->withQueryString();

        // Transform employees to include computed values
        $employees->getCollection()->transform(function ($employee) use ($month, $year) {
            $salary = $employee->salaries->first();
            $pera = $employee->peras->first();
            $rata = $employee->ratas->first();
            $deductions = $employee->deductions;

            $totalDeductions = (float) $deductions->sum('amount');
            $grossPay = (float) ($salary->amount ?? 0) + (float) ($pera->amount ?? 0) + (float) ($rata->amount ?? 0);
            $netPay = $grossPay - $totalDeductions;

            $employee->current_salary = (float) ($salary->amount ?? 0);
            $employee->current_pera = (float) ($pera->amount ?? 0);
            $employee->current_rata = (float) ($rata->amount ?? 0);
            $employee->total_deductions = $totalDeductions;
            $employee->gross_pay = $grossPay;
            $employee->net_pay = $netPay;

            return $employee;
        });

        $offices = Office::orderBy('name')->get();

        return Inertia::render('payroll/index', [
            'employees' => $employees,
            'offices' => $offices,
            'filters' => [
                'month' => (int) $month,
                'year' => (int) $year,
                'office_id' => $officeId,
                'search' => $search,
            ],
        ]);
    }

    public function show(Request $request, Employee $employee)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $employee->load(['employmentStatus', 'office']);

        // Get salary history
        $salaryHistory = $employee->salaries()
            ->orderBy('effective_date', 'desc')
            ->get();

        // Get PERA history
        $peraHistory = $employee->peras()
            ->orderBy('effective_date', 'desc')
            ->get();

        // Get RATA history
        $rataHistory = $employee->ratas()
            ->orderBy('effective_date', 'desc')
            ->get();

        // Get deductions for the period
        $deductions = $employee->deductions()
            ->where('pay_period_month', $month)
            ->where('pay_period_year', $year)
            ->with('deductionType')
            ->get();

        return Inertia::render('payroll/show', [
            'employee' => $employee,
            'salaryHistory' => $salaryHistory,
            'peraHistory' => $peraHistory,
            'rataHistory' => $rataHistory,
            'deductions' => $deductions,
            'filters' => [
                'month' => (int) $month,
                'year' => (int) $year,
            ],
        ]);
    }
}
