<?php

namespace Tests\Feature;

use App\Events\MessageSent;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use App\Models\Hospital;
use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatMessageBroadcastingTest extends TestCase
{
    use RefreshDatabase;

    private function createTestUser($overrides = [])
    {
        return User::create(array_merge([
            'Name' => 'Test User',
            'Phone' => str_pad(rand(0, 9999999999), 10, '0', STR_PAD_LEFT),
            'Password' => bcrypt('password'),
        ], $overrides));
    }

    public function test_message_as_patient_broadcasts_to_pharmacy_agent_logic()
    {
        $patient = $this->createTestUser();
        $agent = $this->createTestUser();
        
        $pharmacy = Pharmacy::create([
            'pharmacy_agent_id' => $agent->id,
            'pharmacy_name_en' => 'Test Pharmacy',
            'pharmacy_name_am' => 'ሙከራ ፋርማሲ',
            'license_number' => 'LC123',
            'pharmacy_license_category' => 'Retail',
            'pharmacy_license_upload' => 'license.pdf',
            'working_hour' => '24/7',
        ]);

        $session = ChatSession::create([
            'patient_id' => $patient->id,
            'pharmacy_id' => $pharmacy->id,
            'status' => 'Initiated',
            'language' => 'en',
        ]);

        $message = ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender_id' => $patient->id,
            'message' => 'Hello Pharmacy',
        ]);

        // Trigger event with eager-loaded relationships
        $message->load(['session.pharmacy', 'session.hospital']);
        
        $event = new MessageSent($message);
        $channels = $event->broadcastOn();

        $this->assertContainsPresenceChannel($channels, 'chat.session.' . $session->id);
        $this->assertContainsPrivateChannel($channels, 'user.' . $agent->id);
    }

    public function test_message_as_patient_broadcasts_to_hospital_agent_logic()
    {
        $patient = $this->createTestUser();
        $agent = $this->createTestUser();
        
        $hospital = Hospital::create([
            'hospital_agent_id' => $agent->id,
            'hospital_name_en' => 'Test Hospital',
            'hospital_name_am' => 'ሙከራ ሆስፒታል',
            'hospital_ownership_type' => 'Private',
            'license_number' => 'LC456',
            'official_license_upload' => 'license.pdf',
            'working_hour' => '24/7',
            'emergency_contact' => '911',
        ]);

        $session = ChatSession::create([
            'patient_id' => $patient->id,
            'hospital_id' => $hospital->id,
            'status' => 'Initiated',
            'language' => 'en',
        ]);

        $message = ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender_id' => $patient->id,
            'message' => 'Hello Hospital',
        ]);

        $message->load(['session.pharmacy', 'session.hospital']);
        
        $event = new MessageSent($message);
        $channels = $event->broadcastOn();

        $this->assertContainsPrivateChannel($channels, 'user.' . $agent->id);
    }

    public function test_message_as_agent_broadcasts_to_patient_logic()
    {
        $patient = $this->createTestUser();
        $agent = $this->createTestUser();
        
        $pharmacy = Pharmacy::create([
            'pharmacy_agent_id' => $agent->id,
            'pharmacy_name_en' => 'Test Pharmacy',
            'pharmacy_name_am' => 'ሙከራ ፋርማሲ',
            'license_number' => 'LC123',
            'pharmacy_license_category' => 'Retail',
            'pharmacy_license_upload' => 'license.pdf',
            'working_hour' => '24/7',
        ]);

        $session = ChatSession::create([
            'patient_id' => $patient->id,
            'pharmacy_id' => $pharmacy->id,
            'status' => 'Initiated',
            'language' => 'en',
        ]);

        $message = ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender_id' => $agent->id,
            'message' => 'Hello Patient',
        ]);

        $message->load(['session.pharmacy', 'session.hospital']);
        
        $event = new MessageSent($message);
        $channels = $event->broadcastOn();

        $this->assertContainsPrivateChannel($channels, 'user.' . $patient->id);
    }

    private function assertContainsPresenceChannel($channels, $name)
    {
        $names = collect($channels)->map(fn($c) => $c->name)->toArray();
        $this->assertContains('presence-' . $name, $names, "Presence channel {$name} not found.");
    }

    private function assertContainsPrivateChannel($channels, $name)
    {
        $names = collect($channels)->map(fn($c) => $c->name)->toArray();
        $this->assertContains('private-' . $name, $names, "Private channel {$name} not found.");
    }
}
