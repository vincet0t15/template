<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Office extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'created_by',
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function boot()
    {
        parent::boot();

        self::creating(function ($office) {
            $office->created_by = Auth::user()->id;
        });
    }
}
