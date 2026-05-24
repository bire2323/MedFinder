<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Seed the application's FAQ table with explicit FAQ content.
     */
    public function run(): void
    {
        $faqs = [
            [
                'id' => 'q1',
                'category' => 'general',
                'question_en' => 'What is MedFinder?',
                'answer_en' => 'MedFinder is an AI-powered healthcare platform that helps patients find hospitals and pharmacies, check drug availability, and navigate to medical facilities using real-time routing.',
                'question_am' => 'MedFinder ምንድን ነው?',
                'answer_am' => 'የ MedFinder መተግበሪያ ለማህበረሰቡ በአቅራቢያቸው የሚገኙ ሆስፒታሎችን እና ፋርማሲዎችን እንዲያገኙ፣ የመድኃኒቶችን መኖር እንዲያረጋግጡ እና እውን የሆኑ የመንገድ አቅጣጫዎች ወደ የሕክምና ተቋማት እንዲጓዙ የሚረዳ በ AI የሚደገፍ መተግበሪያ ነው።',
                'order_priority' => 0,
            ],
            [
                'id' => 'q2',
                'category' => 'patients',
                'question_en' => 'How do I find a specific drug?',
                'answer_en' => 'Use the search bar on the home page or search results page. Filter by Pharmacy and type the drug name to see which verified pharmacies have it in stock.',
                'question_am' => 'አንድን የተወሰነ መድሃኒት እንዴት ማግኘት እችላለሁ?',
                'answer_am' => 'በመነሻ ገጹ ላይ ያለውን የፍለጋ ቦታ ይጠቀሙ። በ ፋርማሲ ይለዩ እና የመድሃኒቱን ስም በመጻፍ የትኞቹ ፋርማሲዎች መድሃኒቱ እንዳላቸው ይመልከቱ።',
                'order_priority' => 1,
            ],
            [
                'id' => 'q3',
                'category' => 'providers',
                'question_en' => 'How do I register my hospital?',
                'answer_en' => 'Click on the Join as Hospital button in the provider section, fill out the registration form with your license details, and wait for admin verification.',
                'question_am' => 'ሆስፒታሌን እንዴት ወደ መተግበሪያው መመዝገብ እችላለሁ?',
                'answer_am' => 'በ መተግበሪያዉ መነሻ ገጽ አገልግሎት አቅራቢው ክፍል ውስጥ እንደ ሆስፒታል ይቀላቀሉ የሚለውን ቁልፍ በመጫን፣ የምዝገባ ቅጹን ከፈቃድ ዝርዝሮችዎ ጋር ይሙሉ እና አስተዳዳሪ እስኪያረጋግጥ ድረስ ይጠብቁ።',
                'order_priority' => 2,
            ],
            [
                'id' => 'q4',
                'category' => 'patients',
                'question_en' => 'Does the map show real-time traffic?',
                'answer_en' => 'Yes, our navigation system uses real-time data to provide the fastest routes to your selected healthcare facility.',
                'question_am' => 'ካርታው አሁናዊ የሆነ የትራፊክ ሁኔታን ያሳያል?',
                'answer_am' => 'አዎ፣ የእኛ የአሰሳ ስርዓት ወደ መረጡት የጤና ተቋም ፈጣን መንገድ ለማቅረብ ትክክለኛ መረጃን ይጠቀማል።',
                'order_priority' => 3,
            ],
        ];

        Faq::truncate();

        foreach ($faqs as $faq) {
            Faq::create([
                'category' => $faq['category'],
                'question_en' => $faq['question_en'],
                'answer_en' => $faq['answer_en'],
                'question_am' => $faq['question_am'],
                'answer_am' => $faq['answer_am'],
                'is_active' => true,
                'role_target' => null,
                'tags' => null,
                'order_priority' => $faq['order_priority'],
            ]);
        }
    }
}
