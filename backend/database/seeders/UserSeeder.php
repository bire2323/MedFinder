<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Define your users and their Spatie roles
        $users = [
            [
                'name' => 'Admin User',
                'phone' => '0911000001',
                'password' => 'admin123',
                'role' => 'admin',
            ],
            [
                'name' => 'Hospital Agent 1',
                'phone' => '0911000002',
                'password' => 'agent123',
                'role' => 'hospitalAgent',
            ],
            [
                'name' => 'Hospital Agent 2',
                'phone' => '0911000003',
                'password' => 'agent123',
                'role' => 'hospitalAgent',
            ],
            [
                'name' => 'Pharmacy Agent 1',
                'phone' => '0911000004',
                'password' => 'agent123',
                'role' => 'pharmacyAgent',
            ],
            [
                'name' => 'Pharmacy Agent 2',
                'phone' => '0911000005',
                'password' => 'agent123',
                'role' => 'pharmacyAgent',
            ],
            [
                'name' => 'John Doe',
                'phone' => '0911000006',
                'password' => 'user123',
                'role' => 'patient', // No special role
            ],
        ];

        foreach ($users as $userData) {
            // Create the user using Eloquent
            $user = User::create([
                'name' => $userData['name'],
                'phone' => $userData['phone'],
                'phone_verified_at' => now(),
                'password' => Hash::make($userData['password']),
            ]);

            // 2. Use Spatie's assignRole method
            if ($userData['role']) {
                // This automatically handles the pivot table entry
                $user->assignRole($userData['role']);
            }
        }
    }
}