<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
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
                    ->orWhere('suffix', 'like', "%{$search}%")
                    ->orWhere('contact_number', 'like', "%{$search}%");
            })
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('settings/Employee/index', [
            'employees' => $employees,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('settings/Employee/create');
    }
}
