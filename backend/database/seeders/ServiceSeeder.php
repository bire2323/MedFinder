<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'service_name_en' => 'General Consultation',
                'service_name_am' => 'አጠቃላይ ምክር',
                'service_category_name_en' => 'Medical',
                'service_category_name_am' => 'ሕክምና',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_name_en' => 'Emergency Care',
                'service_name_am' => 'አስቸኳይ እንክብካቤ',
                'service_category_name_en' => 'Critical',
                'service_category_name_am' => 'አስቸኳይ',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_name_en' => 'Laboratory Testing',
                'service_name_am' => 'የላቦራቶሪ ሙከራ',
                'service_category_name_en' => 'Diagnostic',
                'service_category_name_am' => 'የምርመራ አገልግሎት',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_name_en' => 'Radiology',
                'service_name_am' => 'ሬድዮሎጂ',
                'service_category_name_en' => 'Diagnostic',
                'service_category_name_am' => 'የምርመራ አገልግሎት',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_name_en' => 'Pharmacy Dispensing',
                'service_name_am' => 'የመድሀኒት አስተላልፊ',
                'service_category_name_en' => 'Medication',
                'service_category_name_am' => 'መድሀኒት',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_name_en' => 'Vaccination',
                'service_name_am' => 'ክትትል ማስተካከያ',
                'service_category_name_en' => 'Preventive',
                'service_category_name_am' => 'ከሚከላከያ',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_name_en' => 'Dental Care',
                'service_name_am' => 'የጥርስ እንክብካቤ',
                'service_category_name_en' => 'Specialized',
                'service_category_name_am' => 'ልዩ አገልግሎት',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_name_en' => 'Physiotherapy',
                'service_name_am' => 'ፊዚዮ ህክምና',
                'service_category_name_en' => 'Rehabilitation',
                'service_category_name_am' => 'የእንክብካቤ አገልግሎት',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_name_en' => 'Surgery',
                'service_name_am' => 'ስርግታ',
                'service_category_name_en' => 'Surgical',
                'service_category_name_am' => 'ስርግታ አገልግሎት',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_name_en' => 'Nutrition Counseling',
                'service_name_am' => 'የምግብ ምክር',
                'service_category_name_en' => 'Wellness',
                'service_category_name_am' => 'የጤና እንክብካቤ',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('services')->insert($services);
    }
}
