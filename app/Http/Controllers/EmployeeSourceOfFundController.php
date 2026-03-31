<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmploymentStatus;
use App\Models\Office;
use App\Models\SourceOfFundCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeSourceOfFundController extends Controller
{
    /**
     * Display employees grouped by source of fund code
     */
    public function index(Request $request)
    {
        $year = $request->input('year', now()->year);
        $month = $request->input('month');
        $officeId = $request->input('office_id');
        $sourceOfFundCodeId = $request->input('source_of_fund_code_id');

        // Get all active source of fund codes
        $sourceOfFundCodes = SourceOfFundCode::where('status', true)
            ->orderBy('code')
            ->get();

        // Get offices for filter dropdown
        $offices = Office::orderBy('name')->get();

        // Get employees with their compensation and source of fund
        $employeesQuery = Employee::query()
            ->with(['employmentStatus', 'office'])
            ->when($officeId, function ($query, $officeId) {
                $query->where('office_id', $officeId);
            })
            ->orderBy('last_name', 'asc');

        // If specific source of fund is selected, filter employees who have salary from that fund
        if ($sourceOfFundCodeId) {
            $employeeIds = Employee::query()
                ->join('salaries', 'employees.id', '=', 'salaries.employee_id')
                ->where('salaries.source_of_fund_code_id', $sourceOfFundCodeId)
                ->pluck('employees.id');

            $employeesQuery->whereIn('id', $employeeIds);
        }

        $employees = $employeesQuery->paginate(50)->withQueryString();

        // Load compensation with source of fund for the selected period
        $employees->getCollection()->transform(function ($employee) use ($year, $month) {
            // Get compensation for the selected period
            $salaryQuery = $employee->salaries()
                ->whereYear('effective_date', '<=', $year);

            if ($month) {
                $periodEnd = now()->setDate($year, $month, 1)->endOfMonth();
                $salaryQuery->where('effective_date', '<=', $periodEnd);
            }

            $salary = $salaryQuery->orderBy('effective_date', 'desc')->first();

            $peraQuery = $employee->peras()
                ->whereYear('effective_date', '<=', $year);

            if ($month) {
                $periodEnd = now()->setDate($year, $month, 1)->endOfMonth();
                $peraQuery->where('effective_date', '<=', $periodEnd);
            }

            $pera = $peraQuery->orderBy('effective_date', 'desc')->first();

            $rataQuery = $employee->ratas()
                ->whereYear('effective_date', '<=', $year);

            if ($month) {
                $periodEnd = now()->setDate($year, $month, 1)->endOfMonth();
                $rataQuery->where('effective_date', '<=', $periodEnd);
            }

            $rata = $employee->is_rata_eligible ? $rataQuery->orderBy('effective_date', 'desc')->first() : null;

            // Calculate totals per source of fund (salary only)
            $fundingSources = [];

            // Group salary by source of fund
            if ($salary) {
                $fundCode = $salary->sourceOfFundCode?->code ?? 'Unfunded';
                if (!isset($fundingSources[$fundCode])) {
                    $fundingSources[$fundCode] = [
                        'salary' => 0,
                        'pera' => 0,
                        'rata' => 0,
                        'total' => 0,
                    ];
                }
                $fundingSources[$fundCode]['salary'] += (float)$salary->amount;
                $fundingSources[$fundCode]['total'] += (float)$salary->amount;
            }

            // PERA and RATA are not funded - they're just added to total
            if ($pera) {
                if (!isset($fundingSources['Unfunded'])) {
                    $fundingSources['Unfunded'] = [
                        'salary' => 0,
                        'pera' => 0,
                        'rata' => 0,
                        'total' => 0,
                    ];
                }
                $fundingSources['Unfunded']['pera'] += (float)$pera->amount;
                $fundingSources['Unfunded']['total'] += (float)$pera->amount;
            }

            // Group RATA by source of fund
            if ($rata) {
                if (!isset($fundingSources['Unfunded'])) {
                    $fundingSources['Unfunded'] = [
                        'salary' => 0,
                        'pera' => 0,
                        'rata' => 0,
                        'total' => 0,
                    ];
                }
                $fundingSources['Unfunded']['rata'] += (float)$rata->amount;
                $fundingSources['Unfunded']['total'] += (float)$rata->amount;
            }

            $employee->funding_sources = $fundingSources;
            $employee->total_compensation = array_sum(array_column($fundingSources, 'total'));

            return $employee;
        });

        // Calculate summary statistics
        $summary = [
            'total_employees' => $employees->total(),
            'total_compensation' => $employees->sum('total_compensation'),
            'by_fund' => [],
        ];

        foreach ($employees as $employee) {
            foreach ($employee->funding_sources as $fundCode => $amounts) {
                if (!isset($summary['by_fund'][$fundCode])) {
                    $summary['by_fund'][$fundCode] = [
                        'count' => 0,
                        'total' => 0,
                    ];
                }
                $summary['by_fund'][$fundCode]['count']++;
                $summary['by_fund'][$fundCode]['total'] += $amounts['total'];
            }
        }

        return Inertia::render('Employees/SourceOfFund/Index', [
            'employees' => $employees,
            'sourceOfFundCodes' => $sourceOfFundCodes,
            'offices' => $offices,
            'filters' => [
                'year' => (int)$year,
                'month' => $month ? (int)$month : null,
                'office_id' => $officeId,
                'source_of_fund_code_id' => $sourceOfFundCodeId,
            ],
            'summary' => $summary,
        ]);
    }
}
