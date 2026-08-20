<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function adminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    public function test_search_requires_authentication(): void
    {
        $this->getJson('/api/admin/search?q=test')->assertStatus(401);
    }

    public function test_non_admin_cannot_search(): void
    {
        $student = User::factory()->create();
        $student->assignRole('student');
        Sanctum::actingAs($student);

        $this->getJson('/api/admin/search?q=test')->assertStatus(403);
    }

    public function test_admin_can_search_users_by_name(): void
    {
        Sanctum::actingAs($this->adminUser());

        User::factory()->create(['name' => 'Alice Johnson']);
        User::factory()->create(['name' => 'Bob Smith']);

        $response = $this->getJson('/api/admin/search?q=Alice')
            ->assertOk();

        $this->assertNotEmpty($response->json('data'));
        $foundNames = array_column($response->json('data'), 'title');
        $this->assertContains('Alice Johnson', $foundNames);
    }

    public function test_admin_can_search_users_by_email(): void
    {
        Sanctum::actingAs($this->adminUser());

        User::factory()->create(['email' => 'special@domain.com']);

        $response = $this->getJson('/api/admin/search?q=special@domain.com')
            ->assertOk();

        $this->assertNotEmpty($response->json('data'));
    }

    public function test_admin_can_search_courses(): void
    {
        Sanctum::actingAs($this->adminUser());

        $response = $this->getJson('/api/admin/search?q=scratch&type=courses')
            ->assertOk();

        $data = $response->json('data');
        foreach ($data as $item) {
            $this->assertEquals('course', $item['type']);
        }
    }

    public function test_search_returns_type_field(): void
    {
        Sanctum::actingAs($this->adminUser());

        User::factory()->create(['name' => 'Searchable User']);

        $response = $this->getJson('/api/admin/search?q=Searchable')
            ->assertOk();

        $data = $response->json('data');
        if (count($data) > 0) {
            $this->assertArrayHasKey('type', $data[0]);
            $this->assertArrayHasKey('id', $data[0]);
            $this->assertArrayHasKey('title', $data[0]);
        }
    }

    public function test_search_validates_min_query_length(): void
    {
        Sanctum::actingAs($this->adminUser());

        $this->getJson('/api/admin/search?q=')
            ->assertStatus(422);
    }
}
