<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Reset cached permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions (safe to run multiple times)
        $permissions = [
            'Add drug',
            'edit drug',
            'delete drug',
            'create pharmacy',
            'create hospital',
            'delete user',
            'book services',
            'book departments',
            'chat with bot',
        ];

        foreach ($permissions as $perm) {
            Permission::findOrCreate($perm, 'sanctum');
        }

        // Create roles
        $admin = Role::findOrCreate('admin', 'sanctum');
        $pharmacyAgent = Role::findOrCreate('pharmacyAgent', 'sanctum');
        $hospitalAgent = Role::findOrCreate('hospitalAgent', 'sanctum');
        $patient = Role::findOrCreate('patient', 'sanctum');

        // Assign permissions to roles
        $admin->syncPermissions(Permission::all());

        $pharmacyAgent->syncPermissions(['edit drug', 'delete drug']);

        $hospitalAgent->syncPermissions(['create hospital', 'book departments', 'book services']);

        $patient->syncPermissions(['chat with bot', 'book departments']);

        $this->command->info('Roles and Permissions seeded successfully.');
    }
}