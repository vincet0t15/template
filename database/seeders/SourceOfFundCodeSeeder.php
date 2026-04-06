<?php

namespace Database\Seeders;

use App\Models\SourceOfFundCode;
use Illuminate\Database\Seeder;

class SourceOfFundCodeSeeder extends Seeder
{
    public function run(): void
    {
        // Create parent categories
        $generalFund = SourceOfFundCode::create([
            'code' => 'GF',
            'description' => 'General Fund',
            'status' => true,
            'is_category' => true,
        ]);

        $sefFund = SourceOfFundCode::create([
            'code' => 'SEF',
            'description' => 'Special Educational Fund',
            'status' => true,
            'is_category' => true,
        ]);

        $dfFund = SourceOfFundCode::create([
            'code' => 'DF',
            'description' => 'Development Fund',
            'status' => true,
            'is_category' => true,
        ]);

        $trustFund = SourceOfFundCode::create([
            'code' => 'TF',
            'description' => 'Trust Fund',
            'status' => true,
            'is_category' => true,
        ]);

        // Create child codes for General Fund (GF)
        $gfCodes = [
            ['code' => '1011-01', 'description' => 'General Fund 1011-01'],
            ['code' => '1012', 'description' => 'General Fund 1012'],
            ['code' => '1013', 'description' => 'General Fund 1013'],
            ['code' => '1014', 'description' => 'General Fund 1014'],
            ['code' => '9994', 'description' => 'General Fund 9994'],
        ];

        foreach ($gfCodes as $gfCode) {
            SourceOfFundCode::create([
                'code' => $gfCode['code'],
                'description' => $gfCode['description'],
                'status' => true,
                'is_category' => false,
                'parent_id' => $generalFund->id,
            ]);
        }

        // Create child code for SEF
        SourceOfFundCode::create([
            'code' => '1010_SEF1%',
            'description' => 'Special Educational Fund 1%',
            'status' => true,
            'is_category' => false,
            'parent_id' => $sefFund->id,
        ]);

        // Create child code for DF
        SourceOfFundCode::create([
            'code' => '1010_DF20%',
            'description' => 'Development Fund 20%',
            'status' => true,
            'is_category' => false,
            'parent_id' => $dfFund->id,
        ]);

        // Create child code for TF
        SourceOfFundCode::create([
            'code' => '1010_TF',
            'description' => 'Trust Fund',
            'status' => true,
            'is_category' => false,
            'parent_id' => $trustFund->id,
        ]);
    }
}
