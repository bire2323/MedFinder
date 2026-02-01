<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'department_name_en' => 'Emergency',
                'department_name_am' => 'አስቸኳይ',
                'department_category_name_en' => 'Critical Care',
                'department_category_name_am' => 'አስቸኳይ እንክብካቤ',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'department_name_en' => 'Internal Medicine',
                'department_name_am' => 'የውስጥ ሕክምና',
                'department_category_name_en' => 'Medical',
                'department_category_name_am' => 'ሕክምና',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'department_name_en' => 'Pediatrics',
                'department_name_am' => 'ህፃናት ሕክምና',
                'department_category_name_en' => 'Medical',
                'department_category_name_am' => 'ሕክምና',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'department_name_en' => 'Gynecology & Obstetrics',
                'department_name_am' => 'ሴቶች እና ወሊድ ሕክምና',
                'department_category_name_en' => 'Women Health',
                'department_category_name_am' => 'የሴቶች ጤና',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'department_name_en' => 'Surgery',
                'department_name_am' => 'ቀዶ ሕክምና',
                'department_category_name_en' => 'Surgical',
                'department_category_name_am' => 'ቀዶ አገልግሎት',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'department_name_en' => 'Orthopedics',
                'department_name_am' => 'ኦርቶፔዲክስ',
                'department_category_name_en' => 'Specialized',
                'department_category_name_am' => 'ልዩ አገልግሎት',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'department_name_en' => 'Cardiology',
                'department_name_am' => 'የልብ ሕክምና',
                'department_category_name_en' => 'Specialized',
                'department_category_name_am' => 'ልዩ አገልግሎት',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'department_name_en' => 'Neurology',
                'department_name_am' => 'ነርቭ ሕክምና',
                'department_category_name_en' => 'Specialized',
                'department_category_name_am' => 'ልዩ አገልግሎት',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'department_name_en' => 'Radiology',
                'department_name_am' => 'ሬዲዮሎጂ',
                'department_category_name_en' => 'Diagnostic',
                'department_category_name_am' => 'የምርመራ አገልግሎት',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'department_name_en' => 'Laboratory',
                'department_name_am' => 'ላቦራቶሪ',
                'department_category_name_en' => 'Diagnostic',
                'department_category_name_am' => 'የምርመራ አገልግሎት',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('departments')->insert($departments);
    }
}
