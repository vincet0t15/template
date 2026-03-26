<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Full access to all system features',
                'permissions' => ['*'],
            ],
            [
                'name' => 'hr_manager',
                'display_name' => 'HR Manager',
                'description' => 'Manage employees, payroll, and HR settings',
                'permissions' => [
                    'employees.view',
                    'employees.manage',
                    'payroll.view',
                    'payroll.manage',
                    'claims.manage',
                    'deductions.manage',
                ],
            ],
            [
                'name' => 'accountant',
                'display_name' => 'Accountant',
                'description' => 'View and manage payroll and financial data',
                'permissions' => [
                    'employees.view',
                    'payroll.view',
                    'payroll.manage',
                    'suppliers.view',
                    'suppliers.manage',
                ],
            ],
            [
                'name' => 'viewer',
                'display_name' => 'Viewer',
                'description' => 'View-only access to employees and payroll',
                'permissions' => [
                    'employees.view',
                    'payroll.view',
                ],
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}
