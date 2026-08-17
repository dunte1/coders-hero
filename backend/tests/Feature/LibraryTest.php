<?php

namespace Tests\Feature;

use App\Models\LibraryAuthor;
use App\Models\LibraryBorrowing;
use App\Models\LibraryCategory;
use App\Models\LibraryReadingHistory;
use App\Models\LibraryReservation;
use App\Models\LibraryResource;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LibraryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
    }

    private function user(string $role = 'admin'): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function category(array $overrides = []): LibraryCategory
    {
        return LibraryCategory::create(array_merge([
            'name' => 'E-Books ' . uniqid(),
            'description' => 'Digital books.',
            'is_active' => true,
            'created_by_user_id' => $this->user('admin')->id,
        ], $overrides));
    }

    private function author(array $overrides = []): LibraryAuthor
    {
        return LibraryAuthor::create(array_merge([
            'name' => 'Author ' . uniqid(),
            'bio' => 'Test author bio.',
            'created_by_user_id' => $this->user('admin')->id,
        ], $overrides));
    }

    private function resource(array $overrides = []): LibraryResource
    {
        return LibraryResource::create(array_merge([
            'title' => 'Python Handbook ' . uniqid(),
            'category_id' => $this->category()->id,
            'author_id' => $this->author()->id,
            'description' => 'A coding handbook.',
            'resource_type' => 'ebook',
            'language' => 'en',
            'is_public' => true,
            'download_allowed' => true,
            'is_active' => true,
            'view_count' => 0,
            'created_by_user_id' => $this->user('admin')->id,
        ], $overrides));
    }

    public function test_library_endpoints_require_authentication(): void
    {
        $this->getJson('/api/library/summary')->assertStatus(401);
        $this->getJson('/api/library/resources')->assertStatus(401);
        $this->postJson('/api/library/resources', [])->assertStatus(401);
        $this->getJson('/api/library/borrowings')->assertStatus(401);
        $this->postJson('/api/library/resources/1/borrow')->assertStatus(401);
    }

    public function test_non_librarian_roles_cannot_manage_library(): void
    {
        Sanctum::actingAs($this->user('teacher'), ['*']);

        $this->getJson('/api/library/summary')->assertStatus(403);
        $this->postJson('/api/library/resources', ['title' => 'X'])->assertStatus(403);
        $this->getJson('/api/library/borrowings')->assertStatus(403);
    }

    public function test_admin_and_librarian_can_manage_library(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);
        $this->getJson('/api/library/summary')->assertOk();

        Sanctum::actingAs($this->user('librarian'), ['*']);
        $this->getJson('/api/library/summary')->assertOk();
    }

    public function test_students_can_view_catalog(): void
    {
        $this->resource(['is_public' => true]);

        Sanctum::actingAs($this->user('student'), ['*']);

        $this->getJson('/api/library/catalog')
            ->assertOk()
            ->assertJsonPath('data.0.resource_type', 'ebook');

        $this->getJson('/api/library/categories/options')->assertOk();
    }

    public function test_catalog_hides_inactive_and_private_resources(): void
    {
        $this->resource(['is_public' => true, 'is_active' => true]);
        $this->resource(['is_public' => false, 'is_active' => true]);
        $this->resource(['is_public' => true, 'is_active' => false]);

        Sanctum::actingAs($this->user('student'), ['*']);

        $this->getJson('/api/library/catalog')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_category_crud(): void
    {
        Sanctum::actingAs($this->user('librarian'), ['*']);

        $category = $this->category();

        $this->getJson('/api/library/categories')
            ->assertOk()
            ->assertJsonPath('data.0.id', $category->id);

        $this->postJson('/api/library/categories', [
            'name' => 'Past Papers',
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Past Papers');

        $created = LibraryCategory::where('name', 'Past Papers')->firstOrFail();
        $this->assertNotNull($created->slug);

        $this->putJson('/api/library/categories/' . $category->id, [
            'description' => 'Updated description.',
        ])
            ->assertOk()
            ->assertJsonPath('data.description', 'Updated description.');

        $this->deleteJson('/api/library/categories/' . $category->id)->assertOk();
        $this->assertDatabaseMissing('library_categories', ['id' => $category->id]);
    }

    public function test_author_crud(): void
    {
        Sanctum::actingAs($this->user('librarian'), ['*']);

        $author = $this->author();

        $this->getJson('/api/library/authors')
            ->assertOk()
            ->assertJsonPath('data.0.id', $author->id);

        $this->postJson('/api/library/authors', [
            'name' => 'Jane Doe',
            'bio' => 'Curriculum author.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Jane Doe');

        $this->putJson('/api/library/authors/' . $author->id, [
            'bio' => 'Updated bio.',
        ])
            ->assertOk();

        $this->deleteJson('/api/library/authors/' . $author->id)->assertOk();
        $this->assertDatabaseMissing('library_authors', ['id' => $author->id]);
    }

    public function test_admin_can_create_resource_with_file_upload(): void
    {
        Storage::fake('local');

        Sanctum::actingAs($this->user('admin'), ['*']);

        $file = UploadedFile::fake()->create('handbook.pdf', 1024, 'application/pdf');

        $this->postJson('/api/library/resources', [
            'title' => 'JavaScript Basics',
            'resource_type' => 'ebook',
            'file' => $file,
            'is_public' => true,
            'download_allowed' => true,
        ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'JavaScript Basics')
            ->assertJsonPath('data.resource_type', 'ebook')
            ->assertJsonPath('data.file_size', $file->getSize());

        $resource = LibraryResource::where('title', 'JavaScript Basics')->firstOrFail();
        $this->assertNotNull($resource->file_path);
        $this->assertSame('application/pdf', $resource->mime_type);

        Storage::disk('local')->assertExists($resource->file_path);
    }

    public function test_resource_download_url_only_generated_when_allowed(): void
    {
        Storage::fake('local');

        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $file = UploadedFile::fake()->create('book.pdf', 2048, 'application/pdf');

        $this->postJson('/api/library/resources', [
            'title' => 'Scratch Guide',
            'resource_type' => 'notes',
            'file' => $file,
            'download_allowed' => false,
        ])->assertCreated();

        $resource = LibraryResource::where('title', 'Scratch Guide')->firstOrFail();

        $this->getJson('/api/library/catalog/resources/' . $resource->id)
            ->assertOk()
            ->assertJsonPath('data.download_url', null);
    }

    public function test_borrow_and_return_lifecycle(): void
    {
        $resource = $this->resource(['is_public' => true]);

        $student = $this->user('student');
        Sanctum::actingAs($student, ['*']);

        $this->postJson('/api/library/resources/' . $resource->id . '/borrow')
            ->assertCreated()
            ->assertJsonPath('data.status', 'borrowed');

        $this->assertDatabaseHas('library_borrowings', [
            'resource_id' => $resource->id,
            'user_id' => $student->id,
            'status' => 'borrowed',
        ]);

        // Cannot borrow again while out
        $this->postJson('/api/library/resources/' . $resource->id . '/borrow')
            ->assertStatus(422);

        // Student sees the borrowing in their list
        $this->getJson('/api/library/my/borrowings')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        // Admin returns it
        Sanctum::actingAs($this->user('admin'), ['*']);
        $borrowing = LibraryBorrowing::firstOrFail();

        $this->putJson('/api/library/borrowings/' . $borrowing->id . '/return')
            ->assertOk()
            ->assertJsonPath('data.status', 'returned');

        $this->assertDatabaseHas('library_borrowings', [
            'id' => $borrowing->id,
            'returned_at' => now()->toDateTimeString(),
        ]);
    }

    public function test_reserve_when_borrowed_and_fulfilled_on_return(): void
    {
        $resource = $this->resource(['is_public' => true]);

        $studentA = $this->user('student');
        Sanctum::actingAs($studentA, ['*']);
        $this->postJson('/api/library/resources/' . $resource->id . '/borrow')->assertCreated();

        $studentB = $this->user('student');
        Sanctum::actingAs($studentB, ['*']);
        $this->postJson('/api/library/resources/' . $resource->id . '/reserve')
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        // Duplicate reservation rejected
        $this->postJson('/api/library/resources/' . $resource->id . '/reserve')->assertStatus(422);

        // Returning fulfils the reservation
        Sanctum::actingAs($this->user('admin'), ['*']);
        $borrowing = LibraryBorrowing::firstOrFail();
        $this->putJson('/api/library/borrowings/' . $borrowing->id . '/return')->assertOk();

        $this->assertDatabaseHas('library_reservations', [
            'user_id' => $studentB->id,
            'resource_id' => $resource->id,
            'status' => 'fulfilled',
        ]);
    }

    public function test_cannot_reserve_available_resource(): void
    {
        $resource = $this->resource(['is_public' => true]);

        Sanctum::actingAs($this->user('student'), ['*']);

        $this->postJson('/api/library/resources/' . $resource->id . '/reserve')->assertStatus(422);
    }

    public function test_reading_history_is_recorded_on_view(): void
    {
        $resource = $this->resource(['is_public' => true]);

        $student = $this->user('student');
        Sanctum::actingAs($student, ['*']);

        $this->getJson('/api/library/catalog/resources/' . $resource->id)->assertOk();

        $this->assertDatabaseHas('library_reading_history', [
            'resource_id' => $resource->id,
            'user_id' => $student->id,
            'times_read' => 1,
        ]);

        // Second view increments
        $this->getJson('/api/library/catalog/resources/' . $resource->id)->assertOk();

        $this->assertDatabaseHas('library_reading_history', [
            'resource_id' => $resource->id,
            'user_id' => $student->id,
            'times_read' => 2,
        ]);

        $this->getJson('/api/library/my/history')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_resource_show_increments_view_count(): void
    {
        $resource = $this->resource(['is_public' => true]);

        Sanctum::actingAs($this->user('student'), ['*']);

        $this->getJson('/api/library/catalog/resources/' . $resource->id)->assertOk();

        $this->assertSame(1, $resource->fresh()->view_count);
    }

    public function test_resource_management_endpoints(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $resource = $this->resource();

        $this->getJson('/api/library/resources')
            ->assertOk()
            ->assertJsonPath('data.0.id', $resource->id);

        $this->putJson('/api/library/resources/' . $resource->id, [
            'title' => 'Updated Title',
            'is_active' => false,
        ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated Title')
            ->assertJsonPath('data.is_active', false);

        $this->deleteJson('/api/library/resources/' . $resource->id)->assertOk();
        $this->assertSoftDeleted('library_resources', ['id' => $resource->id]);
    }

    public function test_library_summary_reflects_data(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $category = $this->category();
        $this->resource(['is_public' => true, 'category_id' => $category->id]);
        $this->resource(['is_public' => false, 'category_id' => $category->id]);

        $this->getJson('/api/library/summary')
            ->assertOk()
            ->assertJsonPath('data.total_resources', 2)
            ->assertJsonPath('data.public_resources', 1)
            ->assertJsonPath('data.total_categories', 3);
    }

    public function test_resource_search_and_type_filter(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->resource(['title' => 'Python for Kids', 'resource_type' => 'ebook']);
        $this->resource(['title' => 'Robotics Manual', 'resource_type' => 'robotics_manual']);

        $this->getJson('/api/library/resources?search=Python')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Python for Kids');

        $this->getJson('/api/library/resources?type=robotics_manual')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_non_owner_cannot_cancel_others_reservation(): void
    {
        $resource = $this->resource(['is_public' => true]);

        $studentA = $this->user('student');
        $studentB = $this->user('student');

        Sanctum::actingAs($studentA, ['*']);
        $this->postJson('/api/library/resources/' . $resource->id . '/borrow')->assertCreated();

        Sanctum::actingAs($studentB, ['*']);
        $this->postJson('/api/library/resources/' . $resource->id . '/reserve')->assertCreated();

        // studentB tries to cancel studentA's... actually cancel own, but as studentA - not possible.
        Sanctum::actingAs($studentA, ['*']);
        $reservation = LibraryReservation::where('user_id', $studentB->id)->firstOrFail();

        $this->putJson('/api/library/my/reservations/' . $reservation->id . '/cancel')
            ->assertStatus(403);

        // Owner can cancel
        Sanctum::actingAs($studentB, ['*']);
        $this->putJson('/api/library/my/reservations/' . $reservation->id . '/cancel')
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }
}
