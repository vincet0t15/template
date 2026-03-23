<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Claim extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'claim_type_id',
        'claim_date',
        'amount',
        'purpose',
        'remarks',
    ];

    protected $casts = [
        'claim_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function claimType()
    {
        return $this->belongsTo(ClaimType::class);
    }
}
