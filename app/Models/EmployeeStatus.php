<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class EmployeeStatus extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'created_by'
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function boot()
    {
        parent::boot();

        self::creating(function ($employeeStatus) {
            $employeeStatus->created_by = Auth::user()->id;
        });
    }
}
