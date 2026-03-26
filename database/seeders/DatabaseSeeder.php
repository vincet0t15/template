<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call(RoleSeeder::class);

        $adminUser = User::factory()->create([
            'name' => 'Zyrus Vince B. Famini',
            'username' => 'admin',
            'password' => Hash::make('admin123'),
            'is_active' => true,
        ]);

        $adminUser->assignRole('admin');

        $this->call([
            EmployeeStatusSeeder::class,
            EmploymentStatusSeeder::class,
            OfficeSeeder::class,
            DeductionTypeSeeder::class,
            ClaimTypeSeeder::class,
        ]);
    }
}
