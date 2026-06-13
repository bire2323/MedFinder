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
                'Name' => 'Admin User',
                'phone' => '0911000001',
                'password' => 'admin123',
                'role' => 'admin',
            ],
            [
                'Name' => 'Hospital Agent 1',
                'phone' => '0911000002',
                'password' => 'agent123',
                'role' => 'hospitalAgent',
            ],
            [
                'Name' => 'Hospital Agent 2',
                'phone' => '0911000003',
                'password' => 'agent123',
                'role' => 'hospitalAgent',
            ],
            [
                'Name' => 'Pharmacy Agent 1',
                'phone' => '0911000004',
                'password' => 'agent123',
                'role' => 'pharmacyAgent',
            ],
            [
                'Name' => 'Pharmacy Agent 2',
                'phone' => '0911000005',
                'password' => 'agent123',
                'role' => 'pharmacyAgent',
            ],
            [
                'Name' => 'John Doe',
                'phone' => '0911000006',
                'password' => 'user123',
                'role' => 'patient', // No special role
            ],
        ];

        foreach ($users as $userData) {
            // Create the user using Eloquent
            $user = User::create([
                'Name' => $userData['Name'],
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