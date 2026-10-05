<?php

namespace Tests\Feature;

use Tests\TestCase;

class DocumentSearchTest extends TestCase
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

    public function test_guests_cannot_search(): void
    {
        $this->getJson('/documents/search?q=memo')->assertUnauthorized();
    }

    public function test_a_query_shorter_than_two_characters_returns_nothing(): void
    {
        $this->signedIn()
            ->getJson('/documents/search?q=a')
            ->assertOk()
            ->assertExactJson(['data' => []]);
    }

    public function test_a_blank_query_returns_nothing(): void
    {
        $this->signedIn()
            ->getJson('/documents/search?q=%20%20')
            ->assertOk()
            ->assertExactJson(['data' => []]);
    }
}
