<?php

namespace App\Http\Controllers;

use App\Models\DeductionType;
use App\Models\Employee;
use App\Models\EmploymentStatus;
use App\Models\Office;
use App\Models\Pera;
use App\Models\Rata;
use App\Models\Salary;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollController extends Controller
{
    /**
     * Get the effective amount for a specific period from history
     */
    private function getEffectiveAmount($history, int $year, int $month): float
    {
        if ($history->isEmpty()) {
            return 0;
        }

        // Create date for end of the period (last day of month)
        $periodEnd = now()->setDate($year, $month, 1)->endOfMonth();

        // Sort by effective_date descending and find the most recent record
        // that was effective before or during this period
        $effectiveRecord = $history
            ->sortByDesc('effective_date')
            ->first(function ($record) use ($periodEnd) {
                return $record->effective_date <= $periodEnd;
            });

        // If no record found before period end, use the oldest one
        if (!$effectiveRecord) {
            $effectiveRecord = $history->sortBy('effective_date')->first();
        }

        return (float) ($effectiveRecord?->amount ?? 0);
    }
    public function index(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        $officeId = $request->input('office_id');
        $search = $request->input('search');
        $employmentStatusId = $request->input('employment_status_id');

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
            ->when($employmentStatusId, function ($query, $employmentStatusId) {
                $query->where('employment_status_id', $employmentStatusId);
            })
            ->with(['salaries' => function ($query) use ($year, $month) {
                // Load all salaries effective before or during the selected period
                $query->where('effective_date', '<=', now()->setDate($year, $month, 1)->endOfMonth())
                    ->orderBy('effective_date', 'desc');
            }])
            ->with(['peras' => function ($query) use ($year, $month) {
                // Load all PERAs effective before or during the selected period
                $query->where('effective_date', '<=', now()->setDate($year, $month, 1)->endOfMonth())
                    ->orderBy('effective_date', 'desc');
            }])
            ->with(['ratas' => function ($query) use ($year, $month) {
                // Load all RATAs effective before or during the selected period
                $query->where('effective_date', '<=', now()->setDate($year, $month, 1)->endOfMonth())
                    ->orderBy('effective_date', 'desc');
            }])
            ->with(['deductions' => function ($query) use ($month, $year) {
                $query->where('pay_period_month', $month)
                    ->where('pay_period_year', $year)
                    ->with('deductionType');
            }])
            ->orderBy('last_name', 'asc')
            ->paginate(50)
            ->withQueryString();

        // Transform employees to include computed values using historical data
        $employees->getCollection()->transform(function ($employee) use ($month, $year) {
            // Get effective compensation for the selected period
            $salary = $this->getEffectiveAmount($employee->salaries, $year, $month);
            $pera = $this->getEffectiveAmount($employee->peras, $year, $month);
            $rata = $employee->is_rata_eligible ? $this->getEffectiveAmount($employee->ratas, $year, $month) : 0;

            $deductions = $employee->deductions;

            $totalDeductions = (float) $deductions->sum('amount');
            $grossPay = $salary + $pera + $rata;
            $netPay = $grossPay - $totalDeductions;

            $employee->current_salary = $salary;
            $employee->current_pera = $pera;
            $employee->current_rata = $rata;
            $employee->total_deductions = $totalDeductions;
            $employee->gross_pay = $grossPay;
            $employee->net_pay = $netPay;

            return $employee;
        });

        $offices = Office::orderBy('name')->get();
        $employmentStatuses = EmploymentStatus::orderBy('name')->get();

        return Inertia::render('payroll/index', [
            'employees' => $employees,
            'offices' => $offices,
            'employmentStatuses' => $employmentStatuses,
            'filters' => [
                'month' => (int) $month,
                'year' => (int) $year,
                'office_id' => $officeId,
                'employment_status_id' => $employmentStatusId,
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
