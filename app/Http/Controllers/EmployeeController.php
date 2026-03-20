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
            ->when($search, function ($query, $search) {
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('suffix', 'like', "%{$search}%");
            })
            ->orderBy('last_name', 'asc')
            ->with(['employmentStatus', 'office'])
            ->paginate(50)
            ->withQueryString();

        $employmentStatuses = EmploymentStatus::all();
        $offices = Office::all();

        return Inertia::render('settings/Employee/index', [
            'employees' => $employees,
            'employmentStatuses' => $employmentStatuses,
            'offices' => $offices,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(Request $request)
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
            'employment_status_id' => 'required|exists:employment_statuses,id',
            'office_id' => 'required|exists:offices,id',
            'photo' => ['nullable', 'image', 'max:2048', 'mimes:jpg,jpeg,png,webp'],
        ]);

        $path = $request->hasFile('photo')
            ? $request->file('photo')->store('employees', 'public')
            : null;

        // if ($validated['employment_status_id'] == 1) {
        //     $validated['rata'] = null;
        //     $validated['pera'] = null;
        // }
        Employee::create([
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'suffix' => $validated['suffix'],
            'employment_status_id' => $validated['employment_status_id'],
            'office_id' => $validated['office_id'],
            'image_path' => $path,
            'position' => $validated['position'],
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

        // if ($validated['employment_status_id'] == 1) {
        //     $validated['rata'] = null;
        //     $validated['pera'] = null;
        // }

        $employee->update($validated);

        return redirect()->route('employees.index')->with('success', 'Employee updated successfully');
    }
}
