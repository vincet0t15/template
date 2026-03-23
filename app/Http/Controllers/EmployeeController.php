<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmploymentStatus;
use App\Models\Office;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {

        $search = $request->input('search');

        $employees = Employee::query()
            ->when($search, function ($query) use ($search) {
                $query->where('first_name', 'like', '%' . $search . '%')
                    ->orWhere('last_name', 'like', '%' . $search . '%');
            })
            ->with(['office', 'employmentStatus'])
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }

    public function create()
    {
        $employmentStatuses = EmploymentStatus::all();
        $offices = Office::all();

        return Inertia::render('settings/Employee/create', [
            'employmentStatuses' => $employmentStatuses,
            'offices' => $offices,
        ]);
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'is_rata_eligible' => 'boolean',
            'employment_status_id' => 'required|exists:employment_statuses,id',
            'office_id' => 'required|exists:offices,id',
            'photo' => ['nullable', 'image', 'max:2048', 'mimes:jpg,jpeg,png,webp'],
        ]);

        $path = $request->hasFile('photo')
            ? $request->file('photo')->store('employees', 'public')
            : null;

        Employee::create([
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'suffix' => $validated['suffix'],
            'employment_status_id' => $validated['employment_status_id'],
            'office_id' => $validated['office_id'],
            'image_path' => $path,
            'position' => $validated['position'],
            'is_rata_eligible' => $validated['is_rata_eligible'] ?? false,
        ]);


        return redirect()->route('employees.index')->with('success', 'Employee created successfully');
    }

    public function show(Request $request, Employee $employee)
    {
        $employmentStatuses = EmploymentStatus::all();
        $offices = Office::all();

        return Inertia::render('settings/Employee/edit', [
            'employee' => $employee,
            'employmentStatuses' => $employmentStatuses,
            'offices' => $offices,
        ]);
    }

    public function update(Request $request, Employee $employee)
    {

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'is_rata_eligible' => 'boolean',
            'employment_status_id' => 'required|exists:employment_statuses,id',
            'office_id' => 'required|exists:offices,id',
            'photo' => ['nullable', 'image', 'max:2048', 'mimes:jpg,jpeg,png,webp'],
        ]);

        if ($request->hasFile('photo')) {
            if ($employee->image_path) {
                Storage::disk('public')->delete($employee->image_path);
            }
            $employee->image_path = $request->file('photo')->store('employees', 'public');
        }

        $validated = $request->suffix == 'None' ? array_merge($validated, ['suffix' => null]) : $validated;
        $employee->update($validated);

        return redirect()->back()->with('success', 'Employee updated successfully');
    }

    public function destroy(Employee $employee)
    {
        if ($employee->image_path) {
            Storage::disk('public')->delete($employee->image_path);
        }

        $employee->delete();

        return redirect()->route('employees.index')->with('success', 'Employee deleted successfully');
    }
}
