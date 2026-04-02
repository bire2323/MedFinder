<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // e.g., 'general', 'patients', 'providers'
            $table->text('question_en');
            $table->text('question_am');
            $table->text('answer_en');
            $table->text('answer_am');
            $table->boolean('is_active')->default(true);
            $table->json('role_target')->nullable(); // e.g., ["user", "pharmacy", "admin"]
            $table->string('tags')->nullable(); // comma separated keywords for search indexing
            $table->integer('order_priority')->default(0);
            $table->timestamps();
            $table->softDeletes();
            
            // Fulltext index for search performance (MySQL 5.7+)
            // $table->fullText(['question_en', 'question_am', 'answer_en', 'answer_am']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};
