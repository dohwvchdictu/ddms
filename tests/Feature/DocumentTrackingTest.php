<?php

namespace Tests\Feature;

use App\Actions\Documents\DocumentTracking;
use Mockery\MockInterface;
use Tests\TestCase;

class DocumentTrackingTest extends TestCase
{
    protected function signedIn(): self
    {
        return $this->withSession([
            'jwt_token' => 'token',
            'user' => ['id' => 7, 'firstName' => 'Juan', 'office' => ['id' => 3]],
            'token_created_at' => time(),
            'revalidated_at' => time(),
        ]);
    }

    public function test_guests_cannot_see_tracking(): void
    {
        $this->getJson('/documents/1/tracking')->assertRedirect(route('login'));
    }

    public function test_an_unknown_document_is_not_found(): void
    {
        $this->mock(DocumentTracking::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->with(999)->andReturn(null));

        $this->signedIn()->getJson('/documents/999/tracking')->assertNotFound();
    }

    public function test_tracking_is_returned_as_json(): void
    {
        $this->mock(DocumentTracking::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->with(42)->andReturn([
            'document' => ['id' => 42, 'control_no' => 'DC1', 'status' => 'For Receiving', 'current_location' => 'ICTU'],
            'timeline' => [[
                'key' => 'log-1',
                'action' => 'Forwarded',
                'offices' => [['label' => 'From', 'name' => 'Records'], ['label' => 'To', 'name' => 'ICTU']],
            ]],
        ]));

        $this->signedIn()
            ->getJson('/documents/42/tracking')
            ->assertOk()
            ->assertJsonPath('document.control_no', 'DC1')
            ->assertJsonPath('document.current_location', 'ICTU')
            ->assertJsonPath('timeline.0.offices.1.name', 'ICTU');
    }

    public function test_the_document_id_must_be_numeric(): void
    {
        $this->signedIn()->getJson('/documents/abc/tracking')->assertNotFound();
    }
}
