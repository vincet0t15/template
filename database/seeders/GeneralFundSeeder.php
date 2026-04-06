<?php

namespace Database\Seeders;

use App\Models\GeneralFund;
use Illuminate\Database\Seeder;

class GeneralFundSeeder extends Seeder
{
    public function run(): void
    {
        $funds = [
            ['code' => 'GF', 'description' => 'General Fund'],
            ['code' => 'SEF', 'description' => 'Special Educational Fund'],
            ['code' => 'DF', 'description' => 'Development Fund'],
            ['code' => 'TF', 'description' => 'Trust Fund'],
        ];

        foreach ($funds as $fund) {
            GeneralFund::create([
                'code' => $fund['code'],
                'description' => $fund['description'],
                'status' => true,
            ]);
        }
    }
}
