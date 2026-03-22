<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class EmployeeDeduction extends Model
{
    protected $fillable = [
        'employee_id',
        'deduction_type_id',
        'amount',
        'pay_period_month',
        'pay_period_year',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'pay_period_month' => 'integer',
        'pay_period_year' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function deductionType()
    {
        return $this->belongsTo(DeductionType::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function boot()
    {
        parent::boot();

        self::creating(function ($deduction) {
            $deduction->created_by = Auth::id();
        });
    }

    /**
     * Scope to filter by pay period
     */
    public function scopeForPeriod($query, int $month, int $year)
    {
        return $query->where('pay_period_month', $month)
            ->where('pay_period_year', $year);
    }
}
