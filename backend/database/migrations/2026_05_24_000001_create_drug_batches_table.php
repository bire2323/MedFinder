<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drug_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drug_id')->constrained('drugs')->cascadeOnDelete();
            $table->string('batch_number')->index();
            $table->date('manufacture_date')->nullable();
            $table->date('expiration_date')->index();
            $table->string('manufacturer')->nullable();
            $table->string('supplier_name')->nullable();
            $table->string('category')->nullable();
            $table->string('dosage_form')->nullable();
            $table->string('certification_number')->nullable();
            $table->string('lot_number')->nullable();
            $table->enum('status', ['ACTIVE', 'EXPIRED', 'RECALLED', 'DISCONTINUED'])->default('ACTIVE');
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['drug_id', 'batch_number', 'manufacture_date'], 'drug_batch_unique');
            $table->index(['drug_id', 'expiration_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drug_batches');
    }
};
