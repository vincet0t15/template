<?php

use App\Http\Controllers\DeductionTypeController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeDeductionController;
use App\Http\Controllers\EmployeeManage;
use App\Http\Controllers\EmploymentStatusController;
use App\Http\Controllers\OfficeController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\PeraController;
use App\Http\Controllers\RataController;
use App\Http\Controllers\SalaryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // PAYROLL
    Route::prefix('payroll')->group(function () {
        Route::get('/', [PayrollController::class, 'index'])->name('payroll.index');
        Route::get('{employee}', [PayrollController::class, 'show'])->name('payroll.show');
    });

    // SALARIES
    Route::prefix('salaries')->group(function () {
        Route::get('/', [SalaryController::class, 'index'])->name('salaries.index');
        Route::get('history/{employee}', [SalaryController::class, 'history'])->name('salaries.history');
        Route::post('/', [SalaryController::class, 'store'])->name('salaries.store');
        Route::delete('{salary}', [SalaryController::class, 'destroy'])->name('salaries.destroy');
    });

    // PERA
    Route::prefix('peras')->group(function () {
        Route::get('/', [PeraController::class, 'index'])->name('peras.index');
        Route::get('history/{employee}', [PeraController::class, 'history'])->name('peras.history');
        Route::post('/', [PeraController::class, 'store'])->name('peras.store');
        Route::delete('{pera}', [PeraController::class, 'destroy'])->name('peras.destroy');
    });

    // RATA
    Route::prefix('ratas')->group(function () {
        Route::get('/', [RataController::class, 'index'])->name('ratas.index');
        Route::get('history/{employee}', [RataController::class, 'history'])->name('ratas.history');
        Route::post('/', [RataController::class, 'store'])->name('ratas.store');
        Route::delete('{rata}', [RataController::class, 'destroy'])->name('ratas.destroy');
    });

    // DEDUCTION TYPES
    Route::prefix('deduction-types')->group(function () {
        Route::get('/', [DeductionTypeController::class, 'index'])->name('deduction-types.index');
        Route::post('/', [DeductionTypeController::class, 'store'])->name('deduction-types.store');
        Route::put('{deductionType}', [DeductionTypeController::class, 'update'])->name('deduction-types.update');
        Route::delete('{deductionType}', [DeductionTypeController::class, 'destroy'])->name('deduction-types.destroy');
    });

    // EMPLOYEE DEDUCTIONS
    Route::prefix('employee-deductions')->group(function () {
        Route::get('/', [EmployeeDeductionController::class, 'index'])->name('employee-deductions.index');
        Route::post('/', [EmployeeDeductionController::class, 'store'])->name('employee-deductions.store');
        Route::put('{employeeDeduction}', [EmployeeDeductionController::class, 'update'])->name('employee-deductions.update');
        Route::delete('{employeeDeduction}', [EmployeeDeductionController::class, 'destroy'])->name('employee-deductions.destroy');
    });

    // OFFICES
    Route::prefix('settings')->group(function () {
        // EMPLOYMENT STATUS
        Route::get('employment-statuses', [EmploymentStatusController::class, 'index'])->name('employment-statuses.index');
        Route::post('employment-statuses', [EmploymentStatusController::class, 'store'])->name('employment-statuses.store');
        Route::put('employment-statuses/{employmentStatus}', [EmploymentStatusController::class, 'update'])->name('employment-statuses.update');
        Route::delete('employment-statuses/{employmentStatus}', [EmploymentStatusController::class, 'destroy'])->name('employment-statuses.destroy');

        // OFFICES
        Route::get('offices', [OfficeController::class, 'index'])->name('offices.index');
        Route::post('offices', [OfficeController::class, 'store'])->name('offices.store');
        Route::put('offices/{office}', [OfficeController::class, 'update'])->name('offices.update');
        Route::delete('offices/{office}', [OfficeController::class, 'destroy'])->name('offices.destroy');

        // EMPLOYEES
        Route::get('employees', [EmployeeController::class, 'index'])->name('employees.index');
        Route::get('employees/create', [EmployeeController::class, 'create'])->name('employees.create');
        Route::post('employees', [EmployeeController::class, 'store'])->name('employees.store');
        Route::put('employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
        Route::delete('employees/{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
        Route::get('employees/{employee}', [EmployeeController::class, 'show'])->name('employees.show');

        // EMPLOYEE MANAGE
        Route::get('employees/manage/{employee}', [EmployeeManage::class, 'show'])->name('employees.manage.show');
    });
});

// require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
