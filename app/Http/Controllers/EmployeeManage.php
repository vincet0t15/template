<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmploymentStatus;
use App\Models\Office;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeManage extends Controller
{
    public function show(Request $request, Employee $employee)
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
        ]);

        $employmentStatuses = EmploymentStatus::all();
        $offices = Office::all();

        return Inertia::render('Employees/Manage/Manage', [
            'employee' => $employee,
            'employmentStatuses' => $employmentStatuses,
            'offices' => $offices,
        ]);
    }
}
