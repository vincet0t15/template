<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->with('role')
            ->select(['id', 'name', 'username', 'is_active', 'is_super_admin', 'role_id', 'created_at'])
            ->orderBy('name')
            ->get();

        $roles = Role::query()
            ->select(['id', 'name', 'display_name'])
            ->orderBy('display_name')
            ->get();

        return Inertia::render('Accounts/index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'is_active' => 'boolean',
            'is_super_admin' => 'boolean',
            'role_id' => 'nullable|exists:roles,id',
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'Account updated successfully');
    }
}
