<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->select(['id', 'name', 'username', 'is_active', 'is_super_admin', 'created_at'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Accounts/index', [
            'users' => $users,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'is_active' => 'boolean',
            'is_super_admin' => 'boolean',
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'Account updated successfully');
    }
}
