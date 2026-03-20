<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeManage extends Controller
{
    public function show(Request $request)
    {
        return Inertia::render('settings/Employee/manage/index');
    }
}
