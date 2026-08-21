<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetMaintenanceRecord;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'superadmin@codershero.com')->first();
        $adminId = $admin?->id;

        $categories = [
            'Laptops' => 'Portable computers issued to staff and students.',
            'Computers' => 'Desktop computers and workstations.',
            'Arduino Kits' => 'Arduino boards and starter kits.',
            'LEGO Kits' => 'LEGO robotics kits and spare bricks.',
            'Robotics Equipment' => 'Robotics lab hardware and accessories.',
            'Projectors' => 'Projectors and presentation equipment.',
            'Furniture' => 'Desks, chairs and lab furniture.',
            'Books' => 'Textbooks and library books.',
            'Consumables' => 'Consumable supplies such as paper and cables.',
            'Sensors' => 'Electronic sensors for robotics projects.',
            'Electronic Components' => 'Resistors, breadboards, motors and components.',
        ];

        $categoryIds = [];

        foreach ($categories as $name => $description) {
            $category = AssetCategory::updateOrCreate(
                ['name' => $name],
                [
                    'description' => $description,
                    'is_active' => true,
                    'created_by_user_id' => $adminId,
                ]
            );
            $categoryIds[$name] = $category->id;
        }

        $locations = [
            ['name' => 'Main Office', 'code' => 'OFF-01', 'description' => 'Administration office.'],
            ['name' => 'Computer Lab 1', 'code' => 'LAB-01', 'description' => 'Main computer laboratory.'],
            ['name' => 'Robotics Lab', 'code' => 'LAB-02', 'description' => 'Robotics and electronics laboratory.'],
            ['name' => 'Store Room', 'code' => 'STR-01', 'description' => 'General store room.'],
            ['name' => 'Library', 'code' => 'LIB-01', 'description' => 'School library.'],
        ];

        $locationIds = [];

        foreach ($locations as $location) {
            $model = Location::updateOrCreate(
                ['code' => $location['code']],
                [
                    'name' => $location['name'],
                    'description' => $location['description'],
                    'is_active' => true,
                    'created_by_user_id' => $adminId,
                ]
            );
            $locationIds[$location['name']] = $model->id;
        }

        $assets = [
            ['name' => 'Dell Latitude 5420', 'category' => 'Laptops', 'location' => 'Main Office', 'serial' => 'DL-5420-001', 'condition' => 'good', 'status' => 'available', 'cost' => 125000, 'supplier' => 'Dell East Africa'],
            ['name' => 'HP EliteBook 840 G8', 'category' => 'Laptops', 'location' => 'Main Office', 'serial' => 'HP-840-002', 'condition' => 'good', 'status' => 'assigned', 'cost' => 118000, 'supplier' => 'HP Kenya'],
            ['name' => 'Lenovo ThinkCentre M75', 'category' => 'Computers', 'location' => 'Computer Lab 1', 'serial' => 'LN-M75-003', 'condition' => 'fair', 'status' => 'available', 'cost' => 78000, 'supplier' => 'Lenovo Kenya'],
            ['name' => 'Arduino Mega 2560 Kit', 'category' => 'Arduino Kits', 'location' => 'Robotics Lab', 'serial' => 'AR-MEGA-004', 'condition' => 'new', 'status' => 'available', 'cost' => 8500, 'supplier' => 'Circuitrobo'],
            ['name' => 'LEGO Mindstorms EV3', 'category' => 'LEGO Kits', 'location' => 'Robotics Lab', 'serial' => 'LE-EV3-005', 'condition' => 'good', 'status' => 'in_maintenance', 'cost' => 45000, 'supplier' => 'LEGO Education'],
            ['name' => 'Epson EB-X51 Projector', 'category' => 'Projectors', 'location' => 'Computer Lab 1', 'serial' => 'EP-X51-006', 'condition' => 'good', 'status' => 'available', 'cost' => 68000, 'supplier' => 'Epson Kenya'],
            // Furniture
            ['name' => 'Student Desk - Standard', 'category' => 'Furniture', 'location' => 'Computer Lab 1', 'serial' => 'FRN-Desk-001', 'condition' => 'good', 'status' => 'available', 'cost' => 8500, 'supplier' => 'Kenya Furniture Ltd'],
            ['name' => 'Student Chair - Stackable', 'category' => 'Furniture', 'location' => 'Computer Lab 1', 'serial' => 'FRN-Chair-002', 'condition' => 'good', 'status' => 'available', 'cost' => 4200, 'supplier' => 'Kenya Furniture Ltd'],
            ['name' => 'Teacher Desk - Executive', 'category' => 'Furniture', 'location' => 'Main Office', 'serial' => 'FRN-TDesk-003', 'condition' => 'new', 'status' => 'available', 'cost' => 22000, 'supplier' => 'Kenya Furniture Ltd'],
            ['name' => 'Bookshelf - 5 Tier', 'category' => 'Furniture', 'location' => 'Library', 'serial' => 'FRN-Shelf-004', 'condition' => 'good', 'status' => 'available', 'cost' => 15000, 'supplier' => 'Kenya Furniture Ltd'],
            ['name' => 'Lab Workbench', 'category' => 'Furniture', 'location' => 'Robotics Lab', 'serial' => 'FRN-Bench-005', 'condition' => 'good', 'status' => 'available', 'cost' => 35000, 'supplier' => 'Kenya Furniture Ltd'],
        ];

        foreach ($assets as $index => $assetData) {
            $code = 'AST-' . now()->format('y') . str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT);

            Asset::updateOrCreate(
                ['asset_code' => $code],
                [
                    'name' => $assetData['name'],
                    'asset_category_id' => $categoryIds[$assetData['category']] ?? null,
                    'location_id' => $locationIds[$assetData['location']] ?? null,
                    'serial_number' => $assetData['serial'],
                    'qr_code' => 'QR-' . $code,
                    'status' => $assetData['status'],
                    'condition' => $assetData['condition'],
                    'purchase_date' => now()->subMonths(rand(2, 24))->toDateString(),
                    'purchase_cost' => $assetData['cost'],
                    'supplier' => $assetData['supplier'],
                    'notes' => null,
                    'created_by_user_id' => $adminId,
                ]
            );
        }

        if (AssetMaintenanceRecord::count() === 0) {
            $ev3 = Asset::where('serial_number', 'LE-EV3-005')->first();

            if ($ev3) {
                AssetMaintenanceRecord::create([
                    'asset_id' => $ev3->id,
                    'maintenance_date' => now()->subDays(3)->toDateString(),
                    'description' => 'Replaced broken motor and recalibrated sensors.',
                    'status' => 'in_progress',
                    'cost' => 2500,
                    'note' => 'Awaiting replacement gearbox.',
                    'reported_by_user_id' => $adminId,
                ]);
            }
        }

        $stockItems = [
            ['name' => 'USB-C Cables 1m', 'sku' => 'USB-C-1M', 'category' => 'Consumables', 'location' => 'Store Room', 'qty' => 80, 'unit' => 'pcs', 'reorder' => 20, 'cost' => 350],
            ['name' => 'HDMI Cables 2m', 'sku' => 'HDMI-2M', 'category' => 'Consumables', 'location' => 'Store Room', 'qty' => 15, 'unit' => 'pcs', 'reorder' => 20, 'cost' => 800],
            ['name' => 'A4 Paper Ream', 'sku' => 'A4-PAPER', 'category' => 'Consumables', 'location' => 'Store Room', 'qty' => 42, 'unit' => 'ream', 'reorder' => 10, 'cost' => 650],
            ['name' => 'Arduino Uno R3', 'sku' => 'ARDUINO-UNO', 'category' => 'Arduino Kits', 'location' => 'Robotics Lab', 'qty' => 6, 'unit' => 'pcs', 'reorder' => 8, 'cost' => 3200],
            ['name' => 'Ultrasonic Sensor HC-SR04', 'sku' => 'SNS-HCSR04', 'category' => 'Sensors', 'location' => 'Robotics Lab', 'qty' => 25, 'unit' => 'pcs', 'reorder' => 5, 'cost' => 450],
            ['name' => 'Breadboard 830 Point', 'sku' => 'BB-830', 'category' => 'Electronic Components', 'location' => 'Robotics Lab', 'qty' => 30, 'unit' => 'pcs', 'reorder' => 10, 'cost' => 300],
            // Books
            ['name' => 'Python for Kids', 'sku' => 'BK-PY-KIDS', 'category' => 'Books', 'location' => 'Library', 'qty' => 18, 'unit' => 'pcs', 'reorder' => 5, 'cost' => 1500],
            ['name' => 'Scratch Programming Playground', 'sku' => 'BK-SCRATCH', 'category' => 'Books', 'location' => 'Library', 'qty' => 12, 'unit' => 'pcs', 'reorder' => 5, 'cost' => 1800],
            ['name' => 'HTML & CSS: Design and Build Websites', 'sku' => 'BK-HTML-CSS', 'category' => 'Books', 'location' => 'Library', 'qty' => 15, 'unit' => 'pcs', 'reorder' => 5, 'cost' => 2200],
            ['name' => 'JavaScript for Kids', 'sku' => 'BK-JS-KIDS', 'category' => 'Books', 'location' => 'Library', 'qty' => 10, 'unit' => 'pcs', 'reorder' => 5, 'cost' => 1900],
            ['name' => 'Arduino Workshop', 'sku' => 'BK-ARDUINO', 'category' => 'Books', 'location' => 'Library', 'qty' => 8, 'unit' => 'pcs', 'reorder' => 3, 'cost' => 2500],
            ['name' => 'LEGO Mindstorms EV3 Discovery Book', 'sku' => 'BK-LEGO-EV3', 'category' => 'Books', 'location' => 'Library', 'qty' => 6, 'unit' => 'pcs', 'reorder' => 3, 'cost' => 2800],
            ['name' => 'Learn to Code with Scratch', 'sku' => 'BK-SCRATCH-2', 'category' => 'Books', 'location' => 'Library', 'qty' => 14, 'unit' => 'pcs', 'reorder' => 5, 'cost' => 1200],
        ];

        foreach ($stockItems as $itemData) {
            $item = InventoryItem::updateOrCreate(
                ['sku' => $itemData['sku']],
                [
                    'name' => $itemData['name'],
                    'asset_category_id' => $categoryIds[$itemData['category']] ?? null,
                    'location_id' => $locationIds[$itemData['location']] ?? null,
                    'quantity' => $itemData['qty'],
                    'unit' => $itemData['unit'],
                    'reorder_level' => $itemData['reorder'],
                    'unit_cost' => $itemData['cost'],
                    'supplier' => 'Stationery Supplies Ltd',
                    'notes' => null,
                    'is_active' => true,
                    'created_by_user_id' => $adminId,
                ]
            );

            if (StockMovement::where('inventory_item_id', $item->id)->doesntExist()) {
                StockMovement::create([
                    'inventory_item_id' => $item->id,
                    'type' => 'in',
                    'quantity' => $itemData['qty'],
                    'reference' => 'INITIAL-STOCK',
                    'note' => 'Initial stock on hand.',
                    'user_id' => $adminId,
                ]);
            }
        }
    }
}
