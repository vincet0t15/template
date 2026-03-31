<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // Employee permissions
            'employees.view',
            'employees.create',
            'employees.edit',
            'employees.delete',
            'employees.manage',

            // Salary permissions
            'salaries.view',
            'salaries.create',
            'salaries.edit',
            'salaries.delete',

            // PERA permissions
            'peras.view',
            'peras.create',
            'peras.edit',
            'peras.delete',

            // RATA permissions
            'ratas.view',
            'ratas.create',
            'ratas.edit',
            'ratas.delete',

            // Payroll permissions
            'payroll.view',
            'payroll.export',
            'payroll.manage',

            // Supplier permissions
            'suppliers.view',
            'suppliers.manage',

            // Claims permissions
            'claims.view',
            'claims.create',
            'claims.edit',
            'claims.delete',
            'claims.manage',

            // Deductions permissions
            'deductions.view',
            'deductions.create',
            'deductions.edit',
            'deductions.delete',
            'deductions.manage',

            // Settings permissions
            'settings.view',
            'settings.manage',

            // Accounts permissions
            'accounts.view',
            'accounts.manage',

            // Roles & Permissions
            'roles.view',
            'roles.manage',
            'permissions.view',
            'permissions.manage',

            // Source of Fund Codes permissions
            'source_of_fund_codes.view',
            'source_of_fund_codes.store',
            'source_of_fund_codes.edit',
            'source_of_fund_codes.delete',
            'source_of_fund_codes.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web']
            );
        }

        // Create roles
        $superAdminRole = Role::firstOrCreate(['name' => 'super admin', 'guard_name' => 'web']);
        $superAdminRole->syncPermissions(Permission::all());
    }
}
