<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            ModuleSeeder::class,
            CategorySeeder::class,
            DepartmentSeeder::class,
            UserSeeder::class,
            CourseSeeder::class,
            AnnouncementSeeder::class,
            WebsiteSeeder::class,
            ParentPortalSeeder::class,
            TeacherLmsSeeder::class,
            RoboticsSeeder::class,
            CompetitionSeeder::class,
            FinanceSeeder::class,
            HrSeeder::class,
            InventorySeeder::class,
            LibrarySeeder::class,
            CertificateSeeder::class,
            AiPlatformSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
