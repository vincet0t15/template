<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AssignChatPermission extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chat:assign-permission {role?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign chat permissions to a role';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $roleName = $this->argument('role');

        if (!$roleName) {
            $roleName = $this->choice('Which role should have chat access?', [
                'super admin',
                'Admin',
            ]);
        }

        $role = Role::where('name', $roleName)->first();

        if (!$role) {
            $this->error("Role '{$roleName}' not found!");
            return 1;
        }

        // Assign chat permissions
        $permissions = ['chat.view', 'chat.use'];

        foreach ($permissions as $permission) {
            $perm = Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
            $role->givePermissionTo($perm);
        }

        $this->info("✅ Chat permissions assigned to '{$roleName}' role!");
        $this->info("Permissions: chat.view, chat.use");

        return 0;
    }
}
