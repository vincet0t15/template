<?php

namespace App\Http\Controllers;

use App\Models\DeductionType;
use App\Models\Employee;
use App\Models\EmployeeDeduction;
use App\Models\EmploymentStatus;
use App\Models\Office;
use App\Services\PayrollService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeDeductionController extends Controller
{
    public function __construct(
        protected PayrollService $payrollService
    ) {}

    public function index(Request $request): Response
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        $officeId = $request->input('office_id');
        $employmentStatusId = $request->input('employment_status_id');
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
            ->orderBy('last_name')
            ->get();

        $deductionTypes = DeductionType::where('status', true)->orderBy('name')->get();
        $offices = Office::where('status', true)->orderBy('name')->get();
        $employmentStatuses = EmploymentStatus::where('status', true)->orderBy('name')->get();

        return Inertia::render('EmployeeDeductions/Index', [
            'employees' => $employees,
            'deductionTypes' => $deductionTypes,
            'offices' => $offices,
            'employmentStatuses' => $employmentStatuses,
            'filters' => [
                'month' => $month,
                'year' => $year,
                'office_id' => $officeId,
                'employment_status_id' => $employmentStatusId,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the bulk add deduction page
     */
    public function bulkAddPage(): Response
    {
        $employees = Employee::with('office')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'office_id', 'position']);

        $deductionTypes = DeductionType::where('status', true)->orderBy('name')->get();

        return Inertia::render('EmployeeDeductions/BulkAdd', [
            'employees' => $employees,
            'deductionTypes' => $deductionTypes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'salary_id' => 'nullable|exists:salaries,id',
            'deduction_type_id' => 'required|exists:deduction_types,id',
            'amount' => 'required|numeric|min:0',
            'pay_period_month' => 'required|integer|min:1|max:12',
            'pay_period_year' => 'required|integer|min:2020|max:2100',
            'notes' => 'nullable|string',
        ]);

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
            'salary_id' => $validated['salary_id'] ?? null,
            'deduction_type_id' => $validated['deduction_type_id'],
            'amount' => $validated['amount'],
            'pay_period_month' => $validated['pay_period_month'],
            'pay_period_year' => $validated['pay_period_year'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Deduction added successfully');
    }

    public function update(Request $request, EmployeeDeduction $employeeDeduction): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $employeeDeduction->update($validated);

        return redirect()->back()->with('success', 'Deduction updated successfully');
    }

    public function destroy(EmployeeDeduction $employeeDeduction): RedirectResponse
    {
        // Permission is checked via route middleware
        $employeeDeduction->delete();

        return redirect()->back()->with('success', 'Deduction deleted successfully');
    }

    /**
     * Bulk add deductions to multiple employees
     */
    public function bulkStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_ids' => 'required|array|min:1',
            'employee_ids.*' => 'exists:employees,id',
            'deduction_type_id' => 'required|exists:deduction_types,id',
            'amount' => 'required|numeric|min:0',
            'pay_period_month' => 'required|integer|min:1|max:12',
            'pay_period_year' => 'required|integer|min:2020|max:2100',
            'notes' => 'nullable|string',
        ]);

        $added = 0;
        $skipped = 0;
        $errors = [];

        foreach ($validated['employee_ids'] as $employeeId) {
            // Check if deduction already exists
            $exists = EmployeeDeduction::where('employee_id', $employeeId)
                ->where('deduction_type_id', $validated['deduction_type_id'])
                ->where('pay_period_month', $validated['pay_period_month'])
                ->where('pay_period_year', $validated['pay_period_year'])
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            try {
                EmployeeDeduction::create([
                    'employee_id' => $employeeId,
                    'salary_id' => null,
                    'deduction_type_id' => $validated['deduction_type_id'],
                    'amount' => $validated['amount'],
                    'pay_period_month' => $validated['pay_period_month'],
                    'pay_period_year' => $validated['pay_period_year'],
                    'notes' => $validated['notes'] ?? null,
                    'created_by' => Auth::id(),
                ]);
                $added++;
            } catch (\Exception $e) {
                $errors[] = "Failed to add deduction for employee ID: {$employeeId}";
            }
        }

        $message = "Successfully added {$added} deduction(s).";
        if ($skipped > 0) {
            $message .= " Skipped {$skipped} duplicate(s).";
        }
        if (count($errors) > 0) {
            $message .= " " . count($errors) . " error(s) occurred.";
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Bulk update deductions
     */
    public function bulkUpdate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'deduction_ids' => 'required|array|min:1',
            'deduction_ids.*' => 'exists:employee_deductions,id',
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $updated = EmployeeDeduction::whereIn('id', $validated['deduction_ids'])
            ->update([
                'amount' => $validated['amount'],
                'notes' => $validated['notes'] ?? null,
            ]);

        return redirect()->back()->with('success', "Successfully updated {$updated} deduction(s).");
    }

    /**
     * Bulk delete deductions
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'deduction_ids' => 'required|array|min:1',
            'deduction_ids.*' => 'exists:employee_deductions,id',
        ]);

        $deleted = EmployeeDeduction::whereIn('id', $validated['deduction_ids'])->delete();

        return redirect()->back()->with('success', "Successfully deleted {$deleted} deduction(s).");
    }
}
