<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Database\Seeders\PharmacySeeder;
use Database\Seeders\HospitalSeeder;


class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
     
      $this->call([
        RolesAndPermissionsSeeder::class,
    
        HospitalPharmacySeeder::class,
   // HospitalSeeder::class,
    DepartmentSeeder::class,
    ServiceSeeder::class,
    FacilityServiceSeeder::class,
    //PharmacySeeder::class,
    InventorySeeder::class,
    DrugSeeder::class,


]);
    }
}
