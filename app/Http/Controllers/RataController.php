<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Rata;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RataController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $employees = Employee::query()
            ->where('is_rata_eligible', true)
            ->when($search, function ($query, $search) {
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            })
            ->with(['employmentStatus', 'office', 'latestRata'])
            ->orderBy('last_name', 'asc')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('ratas/index', [
            'employees' => $employees,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function history(Request $request, Employee $employee)
    {
        $ratas = $employee->ratas()
            ->with('createdBy')
            ->orderBy('effective_date', 'desc')
            ->get();

        return Inertia::render('ratas/history', [
            'employee' => $employee->load(['employmentStatus', 'office']),
            'ratas' => $ratas,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric|min:0',
            'effective_date' => 'required|date',
        ]);

        Rata::create([
            'employee_id' => $validated['employee_id'],
            'amount' => $validated['amount'],
            'effective_date' => $validated['effective_date'],
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'RATA added successfully');
    }

    public function destroy(Rata $rata)
    {
        $rata->delete();

        return redirect()->back()->with('success', 'RATA record deleted successfully');
    }
}
