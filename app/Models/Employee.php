<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'salary',
        'rata',
        'pera',
        'position',
        'employment_status_id',
        'office_id',
        'created_by',
        'image_path'
    ];

    public function employmentStatus()
    {
        return $this->belongsTo(EmploymentStatus::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function boot()
    {
        parent::boot();

        self::creating(function ($employee) {
            $employee->created_by = Auth::id();
        });
    }
}
