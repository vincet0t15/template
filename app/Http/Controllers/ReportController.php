<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Salary;
use App\Models\SourceOfFundCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function employeesBySourceOfFund()
    {
        $sourceOfFundCodes = SourceOfFundCode::where('status', true)->orderBy('code')->get();

        // Get all employees by default
        $employees = Employee::with(['office', 'employmentStatus'])
            ->orderBy('last_name', 'asc')
            ->get();

        return Inertia::render('reports/EmployeesBySourceOfFund', [
            'sourceOfFundCodes' => $sourceOfFundCodes,
            'employees' => $employees,
        ]);
    }

    public function employeesBySourceOfFundPrint(Request $request)
    {
        $sourceOfFundCodeId = $request->input('source_of_fund_code_id');
        $month = $request->input('month');
        $year = $request->input('year');

        if (!$sourceOfFundCodeId) {
            abort(400, 'Source of fund code is required');
        }

        // Get the source of fund code
        $sourceOfFundCode = SourceOfFundCode::findOrFail($sourceOfFundCodeId);

        // Get employee IDs who have salaries from this source of fund
        $employeeQuery = Salary::query()
            ->where('source_of_fund_code_id', $sourceOfFundCodeId);

        if ($year) {
            $employeeQuery->whereYear('effective_date', $year);
        }

        if ($month) {
            $employeeQuery->whereMonth('effective_date', $month);
        }

        $employeeIds = $employeeQuery->distinct()->pluck('employee_id');

        // Get employees with their details
        $employees = Employee::whereIn('id', $employeeIds)
            ->with(['office', 'employmentStatus'])
            ->orderBy('last_name', 'asc')
            ->get();

        return Inertia::render('reports/EmployeesBySourceOfFundPrint', [
            'employees' => $employees,
            'sourceOfFundCode' => $sourceOfFundCode,
            'filters' => [
                'month' => $month,
                'year' => $year,
            ],
        ]);
    }
}
