<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SourceOfFundCodeController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('SourceOfFundCode/index');
    }
}
