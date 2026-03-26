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

            // Payroll permissions
            'payroll.view',
            'payroll.export',
            'payroll.manage',

            // Supplier permissions
            'suppliers.view',
            'suppliers.manage',

            // Claims permissions
            'claims.view',
            'claims.manage',

            // Deductions permissions
            'deductions.view',
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
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web']
            );
        }

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $adminRole->syncPermissions(Permission::all());

        $hrManagerRole = Role::firstOrCreate(['name' => 'hr_manager', 'guard_name' => 'web']);
        $hrManagerRole->syncPermissions([
            'employees.view',
            'employees.create',
            'employees.edit',
            'employees.delete',
            'employees.manage',
            'payroll.view',
            'payroll.export',
            'payroll.manage',
            'claims.view',
            'claims.manage',
            'deductions.view',
            'deductions.manage',
        ]);

        $accountantRole = Role::firstOrCreate(['name' => 'accountant', 'guard_name' => 'web']);
        $accountantRole->syncPermissions([
            'employees.view',
            'payroll.view',
            'payroll.export',
            'payroll.manage',
            'suppliers.view',
            'suppliers.manage',
            'deductions.view',
        ]);

        $viewerRole = Role::firstOrCreate(['name' => 'viewer', 'guard_name' => 'web']);
        $viewerRole->syncPermissions([
            'employees.view',
            'payroll.view',
        ]);
    }
}
