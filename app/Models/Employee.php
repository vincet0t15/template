<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'position',
        'is_rata_eligible',
        'employment_status_id',
        'office_id',
        'created_by',
        'image_path'
    ];

    protected $casts = [
        'is_rata_eligible' => 'boolean',
    ];

    public function employmentStatus()
    {
        return $this->belongsTo(EmploymentStatus::class);
    }

    public function office()
    {
        return $this->belongsTo(Office::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function salaries()
    {
        return $this->hasMany(Salary::class);
    }

    public function peras()
    {
        return $this->hasMany(Pera::class);
    }

    public function ratas()
    {
        return $this->hasMany(Rata::class);
    }

    public function deductions()
    {
        return $this->hasMany(EmployeeDeduction::class);
    }

    /**
     * Get the latest salary record
     */
    public function latestSalary()
    {
        return $this->salaries()->latest('effective_date');
    }

    /**
     * Get the latest PERA record
     */
    public function latestPera()
    {
        return $this->peras()->latest('effective_date');
    }

    /**
     * Get the latest RATA record
     */
    public function latestRata()
    {
        return $this->ratas()->latest('effective_date');
    }

    public static function boot()
    {
        parent::boot();

        self::creating(function ($employee) {
            $employee->created_by = Auth::id();
        });
    }

    public function getImagePathAttribute($value)
    {
        return $value ? Storage::url($value) : null;
    }
}
