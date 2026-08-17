<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfilePhotoTest extends TestCase
{
    use RefreshDatabase;

    public function test_upload_photo_updates_avatar(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/profile/photo', [
            'photo' => UploadedFile::fake()->image('avatar.jpg'),
        ])->assertStatus(200)
            ->assertJsonPath('data.avatar', fn ($avatar) => is_string($avatar) && str_contains($avatar, 'avatars'));

        $fresh = $user->fresh();

        $this->assertNotNull($fresh->avatar);
        Storage::disk('public')->assertExists($fresh->avatar);
    }

    public function test_upload_photo_requires_valid_image(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/profile/photo', [
            'photo' => UploadedFile::fake()->create('avatar.txt', 10),
        ])->assertStatus(422);
    }
}
