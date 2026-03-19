<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Zyrus Vince B. Famini',
            'email' => 'vincet0t15@gmail.com',
            'password' => Hash::make('admin123'),
        ]);

        $this->call([
            EmployeeStatusSeeder::class,
            EmploymentStatusSeeder::class,
            OfficeSeeder::class,
        ]);
    }
}
