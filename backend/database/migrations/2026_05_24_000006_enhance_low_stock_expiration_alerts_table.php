<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('low_stock_expiration_alerts', function (Blueprint $table) {
             if (!Schema::hasColumn('low_stock_expiration_alerts', 'drug_batch_id')) {
          $table->foreignId('drug_batch_id')
                ->nullable()
                ->after('drug_id')
                ->constrained('drug_batches')
                ->nullOnDelete();
    }

   if (!Schema::hasColumn('low_stock_expiration_alerts', 'alert_type')) {
            $table->enum('alert_type', [
                'LOW_STOCK',
                'EXPIRING_SOON',
                'EXPIRED',
                'NEAR_EXPIRY',
                'CRITICAL_LOW',
            ])->default('LOW_STOCK')->after('drug_batch_id');
   }
   if (!Schema::hasColumn('low_stock_expiration_alerts', 'severity')) {

       $table->enum('severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
           ->default('MEDIUM')
           ->after('alert_type');
   }

if (!Schema::hasColumn('low_stock_expiration_alerts', 'alert_status')) {
            $table->enum('alert_status', ['PENDING', 'NOTIFIED', 'ACKNOWLEDGED', 'RESOLVED'])
                ->default('PENDING')
                ->after('severity');
}
if (!Schema::hasColumn('low_stock_expiration_alerts', 'alert_triggered_at')) {
        $table->dateTime('alert_triggered_at')->nullable()->after('alert_status');
}
if (!Schema::hasColumn('low_stock_expiration_alerts', 'resolved_at')) {
            $table->dateTime('resolved_at')->nullable()->after('notified_date');
}
if (!Schema::hasColumn('low_stock_expiration_alerts', 'notification_metadata')) {
            $table->json('notification_metadata')->nullable()->after('notification_message');
}
if (!Schema::hasColumn('low_stock_expiration_alerts', 'acknowledged_by')) {
            $table->foreignId('acknowledged_by')
                ->nullable()
                ->after('notification_metadata')
                ->constrained('users')
                ->nullOnDelete();
}
        });

        Schema::table('low_stock_expiration_alerts', function (Blueprint $table) {
           $table->index(
    ['pharmacy_id', 'alert_type', 'alert_status'],
    'ls_exp_alerts_pharmacy_type_status_idx'
);
            $table->index(['severity', 'alert_status']);
        });
    }

    public function down(): void
    {
        Schema::table('low_stock_expiration_alerts', function (Blueprint $table) {
            $table->dropForeign(['drug_batch_id']);
            $table->dropForeign(['acknowledged_by']);
            $table->dropIndex(['pharmacy_id', 'alert_type', 'alert_status']);
            $table->dropIndex(['severity', 'alert_status']);
            $table->dropColumn([
                'drug_batch_id',
                'alert_type',
                'severity',
                'alert_status',
                'alert_triggered_at',
                'resolved_at',
                'notification_metadata',
                'acknowledged_by',
            ]);
        });
    }
};
