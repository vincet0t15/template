<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Pera;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PeraController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $employees = Employee::query()
            ->when($search, function ($query, $search) {
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            })
            ->with(['employmentStatus', 'office', 'latestPera'])
            ->orderBy('last_name', 'asc')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('peras/index', [
            'employees' => $employees,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function history(Request $request, Employee $employee)
    {
        $peras = $employee->peras()
            ->with('createdBy')
            ->orderBy('effective_date', 'desc')
            ->get();

        return Inertia::render('peras/history', [
            'employee' => $employee->load(['employmentStatus', 'office']),
            'peras' => $peras,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric|min:0',
            'effective_date' => 'required|date',
        ]);

        Pera::create([
            'employee_id' => $validated['employee_id'],
            'amount' => $validated['amount'],
            'effective_date' => $validated['effective_date'],
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'PERA added successfully');
    }

    public function destroy(Pera $pera)
    {
        $pera->delete();

        return redirect()->back()->with('success', 'PERA record deleted successfully');
    }
}
