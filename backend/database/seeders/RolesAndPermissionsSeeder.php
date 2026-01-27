<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Clear cached permissions
      //  app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        Permission::create(['name' => 'Add drug', 'guard_name' => 'sanctum']);
        Permission::create(['name' => 'edit drug', 'guard_name' => 'sanctum']);
        Permission::create(['name' => 'delete drug', 'guard_name' => 'sanctum']);
        Permission::create(['name' => 'create pharmacy', 'guard_name' => 'sanctum']);
        Permission::create(['name' => 'create hospital', 'guard_name' => 'sanctum']);
        Permission::create(['name' => 'delete user', 'guard_name' => 'sanctum']);
        Permission::create(['name' => 'book services', 'guard_name' => 'sanctum']);
        Permission::create(['name' => 'book departments', 'guard_name' => 'sanctum']);
        Permission::create(['name' => 'chat with bot', 'guard_name' => 'sanctum']);

        // Create roles and assign permissions
        $admin = Role::create(['name' => 'admin', 'guard_name' => 'sanctum']);
        $admin->givePermissionTo(Permission::all());

        $pharmacyAgent = Role::create(['name' => 'pharmacyAgent', 'guard_name' => 'sanctum']);
        $pharmacyAgent->givePermissionTo(['edit drug', 'delete drug']);

        $hospitalAgent = Role::create(['name' => 'hospitalAgent', 'guard_name' => 'sanctum']);
        $hospitalAgent->givePermissionTo(['create hospital','book departments','book services']);

        $patient = Role::create(['name' => 'patient', 'guard_name' => 'sanctum']);
        $patient->givePermissionTo(['chat with bot', 'book departments']);
    }
}
