<?php

namespace Database\Seeders;

use App\Models\RoboticsEquipment;
use App\Models\RoboticsMaintenanceRecord;
use App\Models\RoboticsProject;
use App\Models\RoboticsProjectSubmission;
use App\Models\RoboticsTeam;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RoboticsSeeder extends Seeder
{
    public function run(): void
    {
        $equipment = [
            [
                'name' => 'Arduino Uno Starter Kit',
                'type' => 'kit',
                'sku' => 'ARDUINO-UNO-STARTER',
                'manufacturer' => 'Arduino',
                'description' => 'Complete starter kit with board, breadboard, LEDs, resistors and jumper wires.',
                'quantity_total' => 10,
                'location' => 'Lab Shelf A1',
                'condition' => 'good',
                'status' => 'active',
            ],
            [
                'name' => 'Arduino Uno Rev3',
                'type' => 'arduino_board',
                'sku' => 'A000066',
                'manufacturer' => 'Arduino',
                'description' => 'ATmega328P based microcontroller board.',
                'quantity_total' => 25,
                'location' => 'Lab Drawer B2',
                'condition' => 'good',
                'status' => 'active',
            ],
            [
                'name' => 'LEGO Mindstorms EV3',
                'type' => 'lego_kit',
                'sku' => 'LEGO-31313',
                'manufacturer' => 'LEGO',
                'description' => 'LEGO Mindstorms EV3 robot building set.',
                'quantity_total' => 8,
                'location' => 'Lab Shelf A3',
                'condition' => 'good',
                'status' => 'active',
            ],
            [
                'name' => 'Ultrasonic Distance Sensor HC-SR04',
                'type' => 'sensor',
                'sku' => 'HC-SR04',
                'manufacturer' => 'Generic',
                'description' => 'Ultrasonic distance measuring sensor (2cm - 400cm).',
                'quantity_total' => 40,
                'location' => 'Components Bin 1',
                'condition' => 'good',
                'status' => 'active',
            ],
            [
                'name' => 'Raspberry Pi 4 Model B',
                'type' => 'microcontroller',
                'sku' => 'RPI4-4GB',
                'manufacturer' => 'Raspberry Pi',
                'description' => '4GB single-board computer with dual monitor support.',
                'quantity_total' => 6,
                'location' => 'Lab Cabinet C1',
                'condition' => 'fair',
                'status' => 'active',
            ],
            [
                'name' => 'Servo Motor SG90',
                'type' => 'component',
                'sku' => 'SG90',
                'manufacturer' => 'Tower Pro',
                'description' => 'Micro servo motor, 180 degrees rotation.',
                'quantity_total' => 60,
                'location' => 'Components Bin 4',
                'condition' => 'good',
                'status' => 'active',
            ],
            [
                'name' => 'Retired RCX LEGO Set',
                'type' => 'lego_kit',
                'sku' => 'LEGO-9747',
                'manufacturer' => 'LEGO',
                'description' => 'Legacy RCX robotics set, decommissioned.',
                'quantity_total' => 2,
                'location' => 'Storage Room',
                'condition' => 'poor',
                'status' => 'retired',
            ],
        ];

        foreach ($equipment as $item) {
            $item['quantity_available'] = $item['quantity_total'];
            $item['qr_code'] = 'RBT-' . Str::upper(Str::random(8));

            RoboticsEquipment::updateOrCreate(
                ['sku' => $item['sku']],
                $item
            );
        }

        $students = Student::query()->limit(2)->get();

        if ($students->isEmpty()) {
            return;
        }

        $team = RoboticsTeam::updateOrCreate(
            ['name' => 'RoboWarriors'],
            [
                'description' => 'Junior robotics competition team.',
                'status' => 'active',
            ]
        );

        foreach ($students as $student) {
            $team->members()->syncWithoutDetaching([$student->id => ['role' => 'leader']]);
        }

        $project = RoboticsProject::updateOrCreate(
            ['title' => 'Line Following Robot'],
            [
                'team_id' => $team->id,
                'description' => 'Build a line following robot using the Arduino Uno and IR sensors.',
                'category' => 'competition',
                'status' => 'in_progress',
                'start_date' => now()->subWeeks(2)->toDateString(),
                'deadline' => now()->addWeeks(4)->toDateString(),
                'goals' => ['Assemble chassis', 'Wire sensors', 'Tune PID controller'],
            ]
        );

        $mentor = User::query()->whereHas('roles', fn ($q) => $q->where('name', 'instructor'))->first();

        if ($mentor) {
            $team->update(['mentor_user_id' => $mentor->id]);
        }

        $leader = $students->first();

        if ($leader?->user_id) {
            RoboticsProjectSubmission::updateOrCreate(
                ['project_id' => $project->id, 'submitted_by_user_id' => $leader->user_id],
                [
                    'title' => 'Initial Prototype',
                    'description' => 'First working prototype of the line follower.',
                    'status' => 'submitted',
                    'submitted_at' => now(),
                ]
            );
        }

        $arduino = RoboticsEquipment::where('sku', 'ARDUINO-UNO-STARTER')->first();

        if ($arduino) {
            RoboticsMaintenanceRecord::updateOrCreate(
                ['equipment_id' => $arduino->id, 'type' => 'inspection', 'status' => 'reported'],
                [
                    'recorded_by_user_id' => $mentor?->id ?? User::query()->first()?->id,
                    'issue_description' => 'Scheduled quarterly inspection of all starter kits.',
                    'maintenance_date' => now(),
                ]
            );
        }
    }
}
