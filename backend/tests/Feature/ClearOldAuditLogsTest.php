<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ClearOldAuditLogsTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser()
    {
        // Explicitly create Spatie role for the test
        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'sanctum']);

        $user = User::create([
            'Name' => 'Admin User',
            'Phone' => '0911223344',
            'Password' => bcrypt('password'),
        ]);

        $user->assignRole($role);
        return $user;
    }

    private function createRegularUser()
    {
        return User::create([
            'Name' => 'Regular User',
            'Phone' => '0922334455',
            'Password' => bcrypt('password'),
        ]);
    }

    public function test_unauthorized_users_cannot_clear_logs()
    {
        $user = $this->createRegularUser();
        $this->actingAs($user);

        $response = $this->deleteJson('/api/admin/audit-logs/clear', [
            'period' => '1_month',
        ]);

        $response->assertStatus(403);
    }

    public function test_administrators_can_clear_old_logs()
    {
        $admin = $this->createAdminUser();
        $this->actingAs($admin);

        // Create log older than 1 month
        $oldLog = AuditLog::create([
            'user_id' => $admin->id,
            'category' => 'system',
            'event' => 'test_event',
            'detail' => 'Old audit log',
            'event_status' => 'success',
        ]);
        $oldLog->created_at = now()->subMonths(2);
        $oldLog->save();

        // Create log newer than 1 month
        $newLog = AuditLog::create([
            'user_id' => $admin->id,
            'category' => 'system',
            'event' => 'test_event',
            'detail' => 'New audit log',
            'event_status' => 'success',
        ]);

        $response = $this->deleteJson('/api/admin/audit-logs/clear', [
            'period' => '1_month',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'deleted_count' => 1,
            ]);

        // Assert old log is physically deleted (since forceDelete is used)
        $this->assertDatabaseMissing('audit_log', ['id' => $oldLog->id]);
        $this->assertDatabaseHas('audit_log', ['id' => $newLog->id]);
    }

    public function test_validation_fails_for_invalid_period()
    {
        $admin = $this->createAdminUser();
        $this->actingAs($admin);

        $response = $this->deleteJson('/api/admin/audit-logs/clear', [
            'period' => 'invalid_period',
        ]);

        $response->assertStatus(422);
    }
}
