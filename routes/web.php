<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeManage;
use App\Http\Controllers\EmploymentStatusController;
use App\Http\Controllers\OfficeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

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
