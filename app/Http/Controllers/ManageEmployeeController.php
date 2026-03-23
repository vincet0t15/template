<?php

namespace App\Http\Controllers;

use App\Models\DeductionType;
use App\Models\Employee;
use App\Models\EmployeeDeduction;
use App\Models\EmploymentStatus;
use App\Models\Office;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ManageEmployeeController extends Controller
{
    public function index(Request $request, Employee $employee)
    {
        $employee->load([
            'office',
            'employmentStatus',
            'latestSalary',
            'latestPera',
            'latestRata',
            'salaries' => function ($query) {
                $query->orderBy('effective_date', 'desc');
            },
            'peras' => function ($query) {
                $query->orderBy('effective_date', 'desc');
            },
            'ratas' => function ($query) {
                $query->orderBy('effective_date', 'desc');
            },
            'deductions' => function ($query) {
                $query->with('deductionType')
                    ->orderBy('pay_period_year', 'desc')
                    ->orderBy('pay_period_month', 'desc');
            },
        ]);

        $employmentStatuses = EmploymentStatus::all();
        $offices = Office::all();
        $deductionTypes = DeductionType::active()->get();

        return Inertia::render('Employees/Manage/Manage', [
            'employee' => $employee,
            'employmentStatuses' => $employmentStatuses,
            'offices' => $offices,
            'deductionTypes' => $deductionTypes,
        ]);
    }

    public function storeDeduction(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'pay_period_month' => 'required|integer|min:1|max:12',
            'pay_period_year' => 'required|integer|min:2020|max:2100',
            'deductions' => 'required|array',
            'deductions.*.deduction_type_id' => 'required|exists:deduction_types,id',
            'deductions.*.amount' => 'nullable|numeric|min:0',
        ]);

        foreach ($validated['deductions'] as $deduction) {
            $amount = $deduction['amount'] ?? null;

            if ($amount === null || $amount === '') {
                continue;
            }

            EmployeeDeduction::updateOrCreate(
                [
                    'employee_id' => $employee->id,
                    'deduction_type_id' => $deduction['deduction_type_id'],
                    'pay_period_month' => $validated['pay_period_month'],
                    'pay_period_year' => $validated['pay_period_year'],
                ],
                [
                    'amount' => $deduction['amount'],
                    'created_by' => Auth::id(),
                ]
            );
        }

        return redirect()->back()->with('success', 'Deductions saved successfully');
    }
}
