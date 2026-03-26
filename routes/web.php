<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\ClaimController;
use App\Http\Controllers\ClaimTypeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeductionTypeController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeDeductionController;
use App\Http\Controllers\EmployeeManage;
use App\Http\Controllers\EmployeeSettingController;
use App\Http\Controllers\EmploymentStatusController;
use App\Http\Controllers\ManageEmployeeController;
use App\Http\Controllers\OfficeController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\PeraController;
use App\Http\Controllers\RataController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SupplierTransactionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'active'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // SUPPLIERS
    Route::prefix('suppliers')->group(function () {
        Route::get('/', [SupplierController::class, 'index'])->name('suppliers.index');
        Route::post('/', [SupplierController::class, 'store'])->name('suppliers.store');
        Route::put('{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
        Route::delete('{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

        // Supplier Transactions
        Route::get('{supplier}/transactions', [SupplierTransactionController::class, 'show'])->name('suppliers.transactions.show');
        Route::post('{supplier}/transactions', [SupplierTransactionController::class, 'store'])->name('suppliers.transactions.store');
        Route::put('{supplier}/transactions/{transaction}', [SupplierTransactionController::class, 'update'])->name('suppliers.transactions.update');
        Route::delete('{supplier}/transactions/{transaction}', [SupplierTransactionController::class, 'destroy'])->name('suppliers.transactions.destroy');
    });

    // PAYROLL
    Route::prefix('payroll')->group(function () {
        Route::get('/', [PayrollController::class, 'index'])->name('payroll.index');
        Route::get('export', [PayrollController::class, 'export'])->name('payroll.export');
        Route::get('year-to-date', [PayrollController::class, 'yearToDate'])->name('payroll.year-to-date');
        Route::get('comparison', [PayrollController::class, 'comparison'])->name('payroll.comparison');
        Route::get('print', [PayrollController::class, 'print'])->name('payroll.print');
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


    // EMPLOYEE DEDUCTIONS
    Route::prefix('employee-deductions')->group(function () {
        Route::get('/', [EmployeeDeductionController::class, 'index'])->name('employee-deductions.index');
        Route::post('/', [EmployeeDeductionController::class, 'store'])->name('employee-deductions.store');
        Route::put('{employeeDeduction}', [EmployeeDeductionController::class, 'update'])->name('employee-deductions.update');
        Route::delete('{employeeDeduction}', [EmployeeDeductionController::class, 'destroy'])->name('employee-deductions.destroy');
    });



    // EMPLOYEES
    Route::prefix('employees')->group(function () {
        Route::get('/', [EmployeeController::class, 'index'])->name('employees.index');
        Route::get('create', [EmployeeController::class, 'create'])->name('employees.create');
        Route::post('/', [EmployeeController::class, 'store'])->name('employees.store');
        Route::put('{employee}', [EmployeeController::class, 'update'])->name('employees.update');
        Route::delete('{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
        Route::get('{employee}', [EmployeeController::class, 'show'])->name('employees.show');
    });


    // MANAGE EMPLOYEE
    Route::prefix('manage')->group(function () {
        Route::get('employees/{employee}', [ManageEmployeeController::class, 'index'])->name('manage.employees.index');
        Route::post('employees/{employee}/deductions', [ManageEmployeeController::class, 'storeDeduction'])->name('manage.employees.deductions.store');

        // CLAIMS
        Route::get('employees/{employee}/claims', [ClaimController::class, 'index'])->name('manage.employees.claims.index');
        Route::post('employees/{employee}/claims', [ClaimController::class, 'store'])->name('manage.employees.claims.store');
        Route::put('employees/{employee}/claims/{claim}', [ClaimController::class, 'update'])->name('manage.employees.claims.update');
        Route::delete('employees/{employee}/claims/{claim}', [ClaimController::class, 'destroy'])->name('manage.employees.claims.destroy');
    });

    // EMPLOYEE PRINT REPORT
    Route::get('employees/{employee}/print', [ManageEmployeeController::class, 'print'])->name('employees.print');

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

        // DEDUCTION TYPES
        Route::get('deduction-types', [DeductionTypeController::class, 'index'])->name('deduction-types.index');
        Route::post('deduction-types', [DeductionTypeController::class, 'store'])->name('deduction-types.store');
        Route::put('deduction-types/{deductionType}', [DeductionTypeController::class, 'update'])->name('deduction-types.update');
        Route::delete('deduction-types/{deductionType}', [DeductionTypeController::class, 'destroy'])->name('deduction-types.destroy');

        // DOCUMENT TYPES
        Route::get('document-types', [DocumentTypeController::class, 'index'])->name('document-types.index');
        Route::post('document-types', [DocumentTypeController::class, 'store'])->name('document-types.store');
        Route::put('document-types/{documentType}', [DocumentTypeController::class, 'update'])->name('document-types.update');
        Route::delete('document-types/{documentType}', [DocumentTypeController::class, 'destroy'])->name('document-types.destroy');

        // CLAIM TYPES
        Route::get('claim-types', [ClaimTypeController::class, 'index'])->name('claim-types.index');
        Route::post('claim-types', [ClaimTypeController::class, 'store'])->name('claim-types.store');
        Route::put('claim-types/{claimType}', [ClaimTypeController::class, 'update'])->name('claim-types.update');
        Route::delete('claim-types/{claimType}', [ClaimTypeController::class, 'destroy'])->name('claim-types.destroy');
    });

    // ACCOUNTS
    Route::get('accounts', [AccountController::class, 'index'])->name('accounts.index');
    Route::put('accounts/{user}', [AccountController::class, 'update'])->name('accounts.update');
});

// require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
