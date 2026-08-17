<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetCategory;
use App\Models\AssetMaintenanceRecord;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\RoboticsTeam;
use App\Models\Student;
use App\Models\StockMovement;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);

        Cache::flush();
    }

    private function user(string $role = 'admin'): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function category(array $overrides = []): AssetCategory
    {
        return AssetCategory::create(array_merge([
            'name' => 'Laptops ' . uniqid(),
            'description' => 'Portable computers.',
            'is_active' => true,
            'created_by_user_id' => $this->user('admin')->id,
        ], $overrides));
    }

    private function location(array $overrides = []): Location
    {
        return Location::create(array_merge([
            'name' => 'Store Room ' . uniqid(),
            'code' => 'STR-' . strtoupper(substr(uniqid(), -4)),
            'description' => 'General store.',
            'is_active' => true,
            'created_by_user_id' => $this->user('admin')->id,
        ], $overrides));
    }

    private function asset(array $overrides = []): Asset
    {
        return Asset::create(array_merge([
            'asset_code' => 'AST-' . strtoupper(substr(uniqid(), -8)),
            'name' => 'Dell Laptop ' . uniqid(),
            'asset_category_id' => $this->category()->id,
            'location_id' => $this->location()->id,
            'serial_number' => 'SN-' . uniqid(),
            'qr_code' => 'QR-' . uniqid(),
            'status' => 'available',
            'condition' => 'good',
            'purchase_date' => now()->subYear(),
            'purchase_cost' => 100000,
            'created_by_user_id' => $this->user('admin')->id,
        ], $overrides));
    }

    private function stockItem(array $overrides = []): InventoryItem
    {
        return InventoryItem::create(array_merge([
            'name' => 'Cables ' . uniqid(),
            'sku' => 'SKU-' . strtoupper(substr(uniqid(), -6)),
            'asset_category_id' => $this->category()->id,
            'location_id' => $this->location()->id,
            'quantity' => 50,
            'unit' => 'pcs',
            'reorder_level' => 10,
            'unit_cost' => 500,
            'is_active' => true,
            'created_by_user_id' => $this->user('admin')->id,
        ], $overrides));
    }

    public function test_inventory_endpoints_require_authentication(): void
    {
        $this->getJson('/api/inventory/summary')->assertStatus(401);
        $this->getJson('/api/inventory/assets')->assertStatus(401);
        $this->postJson('/api/inventory/assets', [])->assertStatus(401);
        $this->getJson('/api/inventory/items')->assertStatus(401);
        $this->getJson('/api/inventory/locations')->assertStatus(401);
    }

    public function test_non_inventory_roles_cannot_access_inventory_endpoints(): void
    {
        Sanctum::actingAs($this->user('teacher'), ['*']);

        $this->getJson('/api/inventory/summary')->assertStatus(403);
        $this->postJson('/api/inventory/assets', ['name' => 'X'])->assertStatus(403);
        $this->getJson('/api/inventory/items')->assertStatus(403);
    }

    public function test_admin_and_inventory_officer_can_access_inventory(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);
        $this->getJson('/api/inventory/summary')->assertOk();

        Sanctum::actingAs($this->user('inventory_officer'), ['*']);
        $this->getJson('/api/inventory/summary')->assertOk();
    }

    public function test_category_crud(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $category = $this->category();

        $this->getJson('/api/inventory/categories')
            ->assertOk()
            ->assertJsonPath('data.0.id', $category->id);

        $this->postJson('/api/inventory/categories', [
            'name' => 'Projectors',
            'description' => 'Projection equipment.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Projectors');

        $this->putJson('/api/inventory/categories/' . $category->id, [
            'description' => 'Updated description.',
        ])
            ->assertOk()
            ->assertJsonPath('data.description', 'Updated description.');

        $this->deleteJson('/api/inventory/categories/' . $category->id)->assertOk();
        $this->assertDatabaseMissing('asset_categories', ['id' => $category->id]);
    }

    public function test_category_with_assets_cannot_be_deleted(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $category = $this->category();
        $this->asset(['asset_category_id' => $category->id]);

        $this->deleteJson('/api/inventory/categories/' . $category->id)->assertStatus(422);
        $this->assertDatabaseHas('asset_categories', ['id' => $category->id]);
    }

    public function test_location_crud(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $location = $this->location();

        $this->getJson('/api/inventory/locations')
            ->assertOk()
            ->assertJsonPath('data.0.id', $location->id);

        $this->postJson('/api/inventory/locations', [
            'name' => 'Robotics Lab',
            'code' => 'LAB-02',
        ])
            ->assertCreated()
            ->assertJsonPath('data.code', 'LAB-02');

        $this->putJson('/api/inventory/locations/' . $location->id, [
            'description' => 'Updated.',
        ])
            ->assertOk();

        $this->deleteJson('/api/inventory/locations/' . $location->id)->assertOk();
        $this->assertDatabaseMissing('locations', ['id' => $location->id]);
    }

    public function test_admin_can_manage_assets(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $asset = $this->asset();

        $this->getJson('/api/inventory/assets')
            ->assertOk()
            ->assertJsonPath('data.0.id', $asset->id);

        $this->postJson('/api/inventory/assets', [
            'name' => 'Arduino Mega Kit',
            'serial_number' => 'AR-001',
            'purchase_cost' => 8500,
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Arduino Mega Kit')
            ->assertJsonPath('data.status', 'available');

        $created = Asset::where('name', 'Arduino Mega Kit')->firstOrFail();
        $this->assertNotNull($created->asset_code);
        $this->assertNotNull($created->qr_code);

        $this->putJson('/api/inventory/assets/' . $created->id, [
            'condition' => 'new',
        ])
            ->assertOk()
            ->assertJsonPath('data.condition', 'new');

        $this->getJson('/api/inventory/assets/' . $created->id)
            ->assertOk()
            ->assertJsonPath('data.serial_number', 'AR-001');
    }

    public function test_asset_cannot_be_deleted_while_checked_out(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $student = Student::create([
            'student_id' => 'STU' . uniqid(),
            'user_id' => $this->user('student')->id,
            'first_name' => 'Test',
            'last_name' => 'Student',
            'gender' => 'female',
            'status' => 'active',
        ]);

        $asset = $this->asset();

        $this->postJson('/api/inventory/assets/' . $asset->id . '/assign', [
            'assignee_type' => 'student',
            'assignee_id' => $student->id,
        ])->assertCreated();

        $this->deleteJson('/api/inventory/assets/' . $asset->id)->assertStatus(422);
    }

    public function test_asset_checkout_and_checkin_lifecycle(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $student = Student::create([
            'student_id' => 'STU' . uniqid(),
            'user_id' => $this->user('student')->id,
            'first_name' => 'Test',
            'last_name' => 'Student',
            'gender' => 'male',
            'status' => 'active',
        ]);

        $asset = $this->asset();

        $this->postJson('/api/inventory/assets/' . $asset->id . '/assign', [
            'assignee_type' => 'student',
            'assignee_id' => $student->id,
            'expected_return_at' => now()->addDays(7)->toDateString(),
            'note' => 'For robotics competition.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.assignee_type', 'student');

        $this->assertDatabaseHas('assets', ['id' => $asset->id, 'status' => 'assigned']);

        // Cannot check out twice
        $this->postJson('/api/inventory/assets/' . $asset->id . '/assign', [
            'assignee_type' => 'student',
            'assignee_id' => $student->id,
        ])->assertStatus(422);

        $this->postJson('/api/inventory/assets/' . $asset->id . '/check-in', [
            'note' => 'Returned in good condition.',
        ])->assertOk();

        $this->assertDatabaseHas('assets', ['id' => $asset->id, 'status' => 'available']);

        $assignment = AssetAssignment::where('asset_id', $asset->id)->firstOrFail();
        $this->assertNotNull($assignment->returned_at);

        // Cannot check in again
        $this->postJson('/api/inventory/assets/' . $asset->id . '/check-in')->assertStatus(422);
    }

    public function test_asset_checkout_requires_valid_assignee(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $asset = $this->asset();

        $this->postJson('/api/inventory/assets/' . $asset->id . '/assign', [
            'assignee_type' => 'student',
            'assignee_id' => 999999,
        ])->assertStatus(422);
    }

    public function test_asset_disposal(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $asset = $this->asset();

        $this->postJson('/api/inventory/assets/' . $asset->id . '/dispose', [
            'note' => 'Beyond repair.',
        ])->assertOk();

        $this->assertDatabaseHas('assets', ['id' => $asset->id, 'status' => 'disposed']);

        // Cannot dispose while checked out
        $student = Student::create([
            'student_id' => 'STU' . uniqid(),
            'user_id' => $this->user('student')->id,
            'first_name' => 'Test',
            'last_name' => 'Student',
            'gender' => 'female',
            'status' => 'active',
        ]);

        $asset2 = $this->asset();

        $this->postJson('/api/inventory/assets/' . $asset2->id . '/assign', [
            'assignee_type' => 'student',
            'assignee_id' => $student->id,
        ])->assertCreated();

        $this->postJson('/api/inventory/assets/' . $asset2->id . '/dispose')->assertStatus(422);
    }

    public function test_asset_scan_by_qr_code(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $asset = $this->asset();

        $this->getJson('/api/inventory/assets/scan/' . $asset->qr_code)
            ->assertOk()
            ->assertJsonPath('data.id', $asset->id)
            ->assertJsonPath('data.qr_code_url', fn ($v) => str_starts_with($v, 'data:image/png'));

        $this->getJson('/api/inventory/assets/scan/UNKNOWN-QR')
            ->assertStatus(404);
    }

    public function test_asset_qr_regeneration(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $asset = $this->asset();
        $oldQr = $asset->qr_code;

        $this->getJson('/api/inventory/assets/' . $asset->id . '/qr')
            ->assertOk()
            ->assertJsonPath('data.qr_code_url', fn ($v) => str_starts_with($v, 'data:image/png'));

        $asset->refresh();
        $this->assertNotSame($oldQr, $asset->qr_code);
    }

    public function test_maintenance_record_lifecycle(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $asset = $this->asset();

        $this->postJson('/api/inventory/maintenance', [
            'asset_id' => $asset->id,
            'maintenance_date' => now()->toDateString(),
            'description' => 'Fan noise on startup.',
            'status' => 'reported',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'reported');

        $this->assertDatabaseHas('assets', ['id' => $asset->id, 'status' => 'in_maintenance']);

        $record = AssetMaintenanceRecord::where('asset_id', $asset->id)->firstOrFail();

        $this->putJson('/api/inventory/maintenance/' . $record->id, [
            'status' => 'resolved',
            'cost' => 1200,
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'resolved');

        $this->assertDatabaseHas('assets', ['id' => $asset->id, 'status' => 'available']);
        $this->assertNotNull($record->fresh()->resolved_at);
    }

    public function test_stock_item_crud(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $item = $this->stockItem();

        $this->getJson('/api/inventory/items')
            ->assertOk()
            ->assertJsonPath('data.0.id', $item->id);

        $this->postJson('/api/inventory/items', [
            'name' => 'HDMI Cables',
            'sku' => 'HDMI-' . uniqid(),
            'quantity' => 20,
            'reorder_level' => 5,
            'unit' => 'pcs',
        ])
            ->assertCreated()
            ->assertJsonPath('data.quantity', 20);

        $created = InventoryItem::where('name', 'HDMI Cables')->firstOrFail();

        $this->putJson('/api/inventory/items/' . $created->id, [
            'reorder_level' => 8,
        ])
            ->assertOk()
            ->assertJsonPath('data.reorder_level', 8);

        $this->deleteJson('/api/inventory/items/' . $item->id)->assertOk();
        $this->assertDatabaseMissing('inventory_items', ['id' => $item->id]);
    }

    public function test_stock_movement_increases_quantity(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $item = $this->stockItem(['quantity' => 10]);

        $this->postJson('/api/inventory/items/' . $item->id . '/movements', [
            'type' => 'in',
            'quantity' => 15,
            'reference' => 'PO-1001',
        ])
            ->assertCreated()
            ->assertJsonPath('data.type', 'in');

        $this->assertDatabaseHas('inventory_items', ['id' => $item->id, 'quantity' => 25]);
        $this->assertSame(1, StockMovement::where('inventory_item_id', $item->id)->count());
    }

    public function test_stock_movement_out_reduces_quantity(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $item = $this->stockItem(['quantity' => 10]);

        $this->postJson('/api/inventory/items/' . $item->id . '/movements', [
            'type' => 'out',
            'quantity' => 4,
            'note' => 'Issued to computer lab.',
        ])
            ->assertCreated();

        $this->assertDatabaseHas('inventory_items', ['id' => $item->id, 'quantity' => 6]);
    }

    public function test_stock_movement_cannot_go_negative(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $item = $this->stockItem(['quantity' => 3]);

        $this->postJson('/api/inventory/items/' . $item->id . '/movements', [
            'type' => 'out',
            'quantity' => 10,
        ])->assertStatus(422);

        $this->assertDatabaseHas('inventory_items', ['id' => $item->id, 'quantity' => 3]);
    }

    public function test_low_stock_filter_and_endpoint(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->stockItem(['quantity' => 5, 'reorder_level' => 10]); // low
        $this->stockItem(['quantity' => 100, 'reorder_level' => 10]); // ok

        $this->getJson('/api/inventory/items?low_stock=1')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/inventory/items/low-stock')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_inventory_summary_reflects_data(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->stockItem(['quantity' => 5, 'reorder_level' => 10]);
        $this->asset();

        $this->getJson('/api/inventory/summary')
            ->assertOk()
            ->assertJsonPath('data.total_assets', 1)
            ->assertJsonPath('data.total_stock_items', 1)
            ->assertJsonPath('data.low_stock_items', 1);
    }

    public function test_asset_can_link_to_robotics_equipment(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $equipment = \App\Models\RoboticsEquipment::create([
            'name' => 'Arduino Uno Kit',
            'type' => 'arduino_board',
            'sku' => 'RBT-UNO',
            'quantity_total' => 5,
            'quantity_available' => 5,
            'status' => 'active',
        ]);

        $this->postJson('/api/inventory/assets', [
            'name' => 'Arduino Uno (Inventory)',
            'robotics_equipment_id' => $equipment->id,
        ])
            ->assertCreated()
            ->assertJsonPath('data.robotics_equipment_id', $equipment->id)
            ->assertJsonPath('data.robotics_equipment.name', 'Arduino Uno Kit');
    }
}
