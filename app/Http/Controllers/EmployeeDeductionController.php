<?php

namespace App\Http\Controllers;

use App\Models\DeductionType;
use App\Models\Employee;
use App\Models\EmployeeDeduction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EmployeeDeductionController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        $officeId = $request->input('office_id');
        $search = $request->input('search');

        $employees = Employee::query()
            ->with(['employmentStatus', 'office', 'latestSalary', 'latestPera', 'latestRata'])
            ->when($search, function ($query, $search) {
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            })
            ->when($officeId, function ($query, $officeId) {
                $query->where('office_id', $officeId);
            })
            ->with(['deductions' => function ($query) use ($month, $year) {
                $query->where('pay_period_month', $month)
                    ->where('pay_period_year', $year)
                    ->with('deductionType');
            }])
            ->orderBy('last_name', 'asc')
            ->paginate(50)
            ->withQueryString();

        $deductionTypes = DeductionType::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('employee-deductions/index', [
            'employees' => $employees,
            'deductionTypes' => $deductionTypes,
            'filters' => [
                'month' => (int) $month,
                'year' => (int) $year,
                'office_id' => $officeId,
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'deduction_type_id' => 'required|exists:deduction_types,id',
            'amount' => 'required|numeric|min:0',
            'pay_period_month' => 'required|integer|min:1|max:12',
            'pay_period_year' => 'required|integer|min:2020|max:2100',
            'notes' => 'nullable|string',
        ]);

        // Check for duplicate
        $exists = EmployeeDeduction::where('employee_id', $validated['employee_id'])
            ->where('deduction_type_id', $validated['deduction_type_id'])
            ->where('pay_period_month', $validated['pay_period_month'])
            ->where('pay_period_year', $validated['pay_period_year'])
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Deduction already exists for this employee and period');
        }

        EmployeeDeduction::create([
            'employee_id' => $validated['employee_id'],
            'deduction_type_id' => $validated['deduction_type_id'],
            'amount' => $validated['amount'],
            'pay_period_month' => $validated['pay_period_month'],
            'pay_period_year' => $validated['pay_period_year'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Deduction added successfully');
    }

    public function update(Request $request, EmployeeDeduction $employeeDeduction)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $employeeDeduction->update($validated);

        return redirect()->back()->with('success', 'Deduction updated successfully');
    }

    public function destroy(EmployeeDeduction $employeeDeduction)
    {
        $employeeDeduction->delete();

        return redirect()->back()->with('success', 'Deduction deleted successfully');
    }
}
