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
use Symfony\Component\HttpFoundation\StreamedResponse;

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

    /**
     * Export payroll summary to CSV
     */
    public function export(Request $request)
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
                $query->where('effective_date', '<=', now()->setDate($year, $month, 1)->endOfMonth())
                    ->orderBy('effective_date', 'desc');
            }])
            ->with(['peras' => function ($query) use ($year, $month) {
                $query->where('effective_date', '<=', now()->setDate($year, $month, 1)->endOfMonth())
                    ->orderBy('effective_date', 'desc');
            }])
            ->with(['ratas' => function ($query) use ($year, $month) {
                $query->where('effective_date', '<=', now()->setDate($year, $month, 1)->endOfMonth())
                    ->orderBy('effective_date', 'desc');
            }])
            ->with(['deductions' => function ($query) use ($month, $year) {
                $query->where('pay_period_month', $month)
                    ->where('pay_period_year', $year)
                    ->with('deductionType');
            }])
            ->orderBy('last_name', 'asc')
            ->get();

        // Transform employees to include computed values
        $employees->transform(function ($employee) use ($month, $year) {
            $salary = $this->getEffectiveAmount($employee->salaries, $year, $month);
            $pera = $this->getEffectiveAmount($employee->peras, $year, $month);
            $rata = $employee->is_rata_eligible ? $this->getEffectiveAmount($employee->ratas, $year, $month) : 0;

            $totalDeductions = (float) $employee->deductions->sum('amount');
            $grossPay = $salary + $pera + $rata;
            $netPay = $grossPay - $totalDeductions;

            return [
                'name' => $employee->last_name . ', ' . $employee->first_name . ' ' . $employee->middle_name,
                'position' => $employee->position,
                'office' => $employee->office?->name ?? 'N/A',
                'employment_status' => $employee->employmentStatus?->name ?? 'N/A',
                'salary' => $salary,
                'pera' => $pera,
                'rata' => $rata,
                'gross_pay' => $grossPay,
                'deductions' => $totalDeductions,
                'net_pay' => $netPay,
            ];
        });

        $filename = "payroll_{$year}_{$month}.csv";
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$filename}",
        ];

        return new StreamedResponse(function () use ($employees, $month, $year) {
            $handle = fopen('php://output', 'w');

            // Add header row
            fputcsv($handle, ['Payroll Summary']);
            fputcsv($handle, ['Period:', date('F Y', mktime(0, 0, 0, $month, 1, $year))]);
            fputcsv($handle, ['Generated:', now()->format('Y-m-d H:i:s')]);
            fputcsv($handle, []);

            // Add column headers
            fputcsv($handle, [
                'Employee Name',
                'Position',
                'Office',
                'Employment Status',
                'Salary',
                'PERA',
                'RATA',
                'Gross Pay',
                'Deductions',
                'Net Pay',
            ]);

            // Add data rows
            foreach ($employees as $employee) {
                fputcsv($handle, [
                    $employee['name'],
                    $employee['position'],
                    $employee['office'],
                    $employee['employment_status'],
                    number_format($employee['salary'], 2),
                    number_format($employee['pera'], 2),
                    number_format($employee['rata'], 2),
                    number_format($employee['gross_pay'], 2),
                    number_format($employee['deductions'], 2),
                    number_format($employee['net_pay'], 2),
                ]);
            }

            // Add totals row
            fputcsv($handle, []);
            fputcsv($handle, [
                'TOTALS',
                '',
                '',
                '',
                number_format($employees->sum('salary'), 2),
                number_format($employees->sum('pera'), 2),
                number_format($employees->sum('rata'), 2),
                number_format($employees->sum('gross_pay'), 2),
                number_format($employees->sum('deductions'), 2),
                number_format($employees->sum('net_pay'), 2),
            ]);

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Year-to-date report
     */
    public function yearToDate(Request $request)
    {
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
            ->orderBy('last_name', 'asc')
            ->get();

        // Calculate year-to-date totals for each employee
        $employees->transform(function ($employee) use ($year) {
            // Get all deductions for the year
            $deductions = $employee->deductions()
                ->where('pay_period_year', $year)
                ->get();

            // Get compensation history for the year
            $salaries = $employee->salaries()
                ->whereYear('effective_date', '<=', $year)
                ->orderBy('effective_date', 'desc')
                ->get();

            $peras = $employee->peras()
                ->whereYear('effective_date', '<=', $year)
                ->orderBy('effective_date', 'desc')
                ->get();

            $ratas = $employee->ratas()
                ->whereYear('effective_date', '<=', $year)
                ->orderBy('effective_date', 'desc')
                ->get();

            // Calculate monthly breakdown
            $monthlyData = [];
            $totalSalary = 0;
            $totalPera = 0;
            $totalRata = 0;
            $totalDeductions = 0;
            $totalGrossPay = 0;
            $totalNetPay = 0;

            for ($month = 1; $month <= 12; $month++) {
                $monthDeductions = $deductions
                    ->where('pay_period_month', $month)
                    ->sum('amount');

                $monthSalary = $this->getEffectiveAmount($salaries, $year, $month);
                $monthPera = $this->getEffectiveAmount($peras, $year, $month);
                $monthRata = $employee->is_rata_eligible ? $this->getEffectiveAmount($ratas, $year, $month) : 0;
                $monthGrossPay = $monthSalary + $monthPera + $monthRata;
                $monthNetPay = $monthGrossPay - $monthDeductions;

                $monthlyData[] = [
                    'month' => $month,
                    'salary' => $monthSalary,
                    'pera' => $monthPera,
                    'rata' => $monthRata,
                    'gross_pay' => $monthGrossPay,
                    'deductions' => $monthDeductions,
                    'net_pay' => $monthNetPay,
                ];

                $totalSalary += $monthSalary;
                $totalPera += $monthPera;
                $totalRata += $monthRata;
                $totalDeductions += $monthDeductions;
                $totalGrossPay += $monthGrossPay;
                $totalNetPay += $monthNetPay;
            }

            return [
                'id' => $employee->id,
                'name' => $employee->last_name . ', ' . $employee->first_name . ' ' . $employee->middle_name,
                'position' => $employee->position,
                'office' => $employee->office?->name ?? 'N/A',
                'employment_status' => $employee->employmentStatus?->name ?? 'N/A',
                'is_rata_eligible' => $employee->is_rata_eligible,
                'monthly_data' => $monthlyData,
                'totals' => [
                    'salary' => $totalSalary,
                    'pera' => $totalPera,
                    'rata' => $totalRata,
                    'gross_pay' => $totalGrossPay,
                    'deductions' => $totalDeductions,
                    'net_pay' => $totalNetPay,
                ],
            ];
        });

        $offices = Office::orderBy('name')->get();
        $employmentStatuses = EmploymentStatus::orderBy('name')->get();

        return Inertia::render('payroll/year-to-date', [
            'employees' => $employees,
            'offices' => $offices,
            'employmentStatuses' => $employmentStatuses,
            'filters' => [
                'year' => (int) $year,
                'office_id' => $officeId,
                'employment_status_id' => $employmentStatusId,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Print report - monthly payroll breakdown
     */
    public function print(Request $request)
    {
        $year = $request->input('year', now()->year);
        $officeId = $request->input('office_id');

        $employees = Employee::query()
            ->with(['employmentStatus', 'office'])
            ->when($officeId, function ($query, $officeId) {
                $query->where('office_id', $officeId);
            })
            ->orderBy('last_name', 'asc')
            ->get();

        $officeName = null;
        if ($officeId) {
            $officeName = Office::find($officeId)?->name;
        }

        // Build monthly data
        $monthlyData = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthEmployees = [];
            $totals = [
                'salary' => 0,
                'pera' => 0,
                'rata' => 0,
                'gross_pay' => 0,
                'deductions' => 0,
                'net_pay' => 0,
            ];

            foreach ($employees as $employee) {
                // Get compensation history
                $salaries = $employee->salaries()
                    ->where('effective_date', '<=', now()->setDate($year, $month, 1)->endOfMonth())
                    ->orderBy('effective_date', 'desc')
                    ->get();

                $peras = $employee->peras()
                    ->where('effective_date', '<=', now()->setDate($year, $month, 1)->endOfMonth())
                    ->orderBy('effective_date', 'desc')
                    ->get();

                $ratas = $employee->ratas()
                    ->where('effective_date', '<=', now()->setDate($year, $month, 1)->endOfMonth())
                    ->orderBy('effective_date', 'desc')
                    ->get();

                // Get deductions for this month
                $deductions = $employee->deductions()
                    ->where('pay_period_month', $month)
                    ->where('pay_period_year', $year)
                    ->sum('amount');

                $salary = $this->getEffectiveAmount($salaries, $year, $month);
                $pera = $this->getEffectiveAmount($peras, $year, $month);
                $rata = $employee->is_rata_eligible ? $this->getEffectiveAmount($ratas, $year, $month) : 0;
                $grossPay = $salary + $pera + $rata;
                $netPay = $grossPay - $deductions;

                // Only include employees with compensation
                if ($salary > 0 || $pera > 0 || $rata > 0 || $deductions > 0) {
                    $monthEmployees[] = [
                        'id' => $employee->id,
                        'name' => $employee->last_name . ', ' . $employee->first_name . ' ' . $employee->middle_name,
                        'position' => $employee->position,
                        'office' => $employee->office?->name ?? 'N/A',
                        'salary' => $salary,
                        'pera' => $pera,
                        'rata' => $rata,
                        'gross_pay' => $grossPay,
                        'deductions' => $deductions,
                        'net_pay' => $netPay,
                    ];

                    $totals['salary'] += $salary;
                    $totals['pera'] += $pera;
                    $totals['rata'] += $rata;
                    $totals['gross_pay'] += $grossPay;
                    $totals['deductions'] += $deductions;
                    $totals['net_pay'] += $netPay;
                }
            }

            $monthlyData[] = [
                'month' => $month,
                'year' => $year,
                'employees' => $monthEmployees,
                'totals' => $totals,
            ];
        }

        return Inertia::render('payroll/print', [
            'year' => (int) $year,
            'monthlyData' => $monthlyData,
            'office' => $officeName,
        ]);
    }

    /**
     * Comparison report between two periods
     */
    public function comparison(Request $request)
    {
        $period1Month = $request->input('period1_month', now()->month);
        $period1Year = $request->input('period1_year', now()->year);
        $period2Month = $request->input('period2_month', now()->subMonth()->month);
        $period2Year = $request->input('period2_year', now()->subMonth()->year);
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
            ->orderBy('last_name', 'asc')
            ->get();

        // Calculate data for both periods
        $employees->transform(function ($employee) use ($period1Month, $period1Year, $period2Month, $period2Year) {
            // Period 1 data
            $salaries1 = $employee->salaries()
                ->where('effective_date', '<=', now()->setDate($period1Year, $period1Month, 1)->endOfMonth())
                ->orderBy('effective_date', 'desc')
                ->get();
            $peras1 = $employee->peras()
                ->where('effective_date', '<=', now()->setDate($period1Year, $period1Month, 1)->endOfMonth())
                ->orderBy('effective_date', 'desc')
                ->get();
            $ratas1 = $employee->ratas()
                ->where('effective_date', '<=', now()->setDate($period1Year, $period1Month, 1)->endOfMonth())
                ->orderBy('effective_date', 'desc')
                ->get();
            $deductions1 = $employee->deductions()
                ->where('pay_period_month', $period1Month)
                ->where('pay_period_year', $period1Year)
                ->sum('amount');

            $salary1 = $this->getEffectiveAmount($salaries1, $period1Year, $period1Month);
            $pera1 = $this->getEffectiveAmount($peras1, $period1Year, $period1Month);
            $rata1 = $employee->is_rata_eligible ? $this->getEffectiveAmount($ratas1, $period1Year, $period1Month) : 0;
            $grossPay1 = $salary1 + $pera1 + $rata1;
            $netPay1 = $grossPay1 - $deductions1;

            // Period 2 data
            $salaries2 = $employee->salaries()
                ->where('effective_date', '<=', now()->setDate($period2Year, $period2Month, 1)->endOfMonth())
                ->orderBy('effective_date', 'desc')
                ->get();
            $peras2 = $employee->peras()
                ->where('effective_date', '<=', now()->setDate($period2Year, $period2Month, 1)->endOfMonth())
                ->orderBy('effective_date', 'desc')
                ->get();
            $ratas2 = $employee->ratas()
                ->where('effective_date', '<=', now()->setDate($period2Year, $period2Month, 1)->endOfMonth())
                ->orderBy('effective_date', 'desc')
                ->get();
            $deductions2 = $employee->deductions()
                ->where('pay_period_month', $period2Month)
                ->where('pay_period_year', $period2Year)
                ->sum('amount');

            $salary2 = $this->getEffectiveAmount($salaries2, $period2Year, $period2Month);
            $pera2 = $this->getEffectiveAmount($peras2, $period2Year, $period2Month);
            $rata2 = $employee->is_rata_eligible ? $this->getEffectiveAmount($ratas2, $period2Year, $period2Month) : 0;
            $grossPay2 = $salary2 + $pera2 + $rata2;
            $netPay2 = $grossPay2 - $deductions2;

            // Calculate differences
            $salaryDiff = $salary1 - $salary2;
            $peraDiff = $pera1 - $pera2;
            $rataDiff = $rata1 - $rata2;
            $grossPayDiff = $grossPay1 - $grossPay2;
            $deductionsDiff = $deductions1 - $deductions2;
            $netPayDiff = $netPay1 - $netPay2;

            return [
                'id' => $employee->id,
                'name' => $employee->last_name . ', ' . $employee->first_name . ' ' . $employee->middle_name,
                'position' => $employee->position,
                'office' => $employee->office?->name ?? 'N/A',
                'employment_status' => $employee->employmentStatus?->name ?? 'N/A',
                'is_rata_eligible' => $employee->is_rata_eligible,
                'period1' => [
                    'month' => $period1Month,
                    'year' => $period1Year,
                    'salary' => $salary1,
                    'pera' => $pera1,
                    'rata' => $rata1,
                    'gross_pay' => $grossPay1,
                    'deductions' => $deductions1,
                    'net_pay' => $netPay1,
                ],
                'period2' => [
                    'month' => $period2Month,
                    'year' => $period2Year,
                    'salary' => $salary2,
                    'pera' => $pera2,
                    'rata' => $rata2,
                    'gross_pay' => $grossPay2,
                    'deductions' => $deductions2,
                    'net_pay' => $netPay2,
                ],
                'differences' => [
                    'salary' => $salaryDiff,
                    'pera' => $peraDiff,
                    'rata' => $rataDiff,
                    'gross_pay' => $grossPayDiff,
                    'deductions' => $deductionsDiff,
                    'net_pay' => $netPayDiff,
                ],
            ];
        });

        $offices = Office::orderBy('name')->get();
        $employmentStatuses = EmploymentStatus::orderBy('name')->get();

        return Inertia::render('payroll/comparison', [
            'employees' => $employees,
            'offices' => $offices,
            'employmentStatuses' => $employmentStatuses,
            'filters' => [
                'period1_month' => (int) $period1Month,
                'period1_year' => (int) $period1Year,
                'period2_month' => (int) $period2Month,
                'period2_year' => (int) $period2Year,
                'office_id' => $officeId,
                'employment_status_id' => $employmentStatusId,
                'search' => $search,
            ],
        ]);
    }
}
