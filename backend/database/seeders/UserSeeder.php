<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            // Admin
            [
                'name' => 'Admin User',
                'phone' => '0911000001',
                'phone_verified_at' => now(),
                'password' => Hash::make('admin123'), // always hash passwords
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Hospital Agents
            [
                'name' => 'Hospital Agent 1',
                'phone' => '0911000002',
                'phone_verified_at' => now(),
                'password' => Hash::make('agent123'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Hospital Agent 2',
                'phone' => '0911000003',
                'phone_verified_at' => now(),
                'password' => Hash::make('agent123'),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Pharmacy Agents
            [
                'name' => 'Pharmacy Agent 1',
                'phone' => '0911000004',
                'phone_verified_at' => now(),
                'password' => Hash::make('agent123'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Pharmacy Agent 2',
                'phone' => '0911000005',
                'phone_verified_at' => now(),
                'password' => Hash::make('agent123'),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Regular Users
            [
                'name' => 'John Doe',
                'phone' => '0911000006',
                'phone_verified_at' => now(),
                'password' => Hash::make('user123'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Jane Smith',
                'phone' => '0911000007',
                'phone_verified_at' => now(),
                'password' => Hash::make('user123'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('users')->insert($users);
    }
}
