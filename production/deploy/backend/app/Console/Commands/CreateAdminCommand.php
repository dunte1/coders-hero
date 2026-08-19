<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class CreateAdminCommand extends Command
{
    protected $signature = 'app:create-admin
        {--name=Admin User : Full name of the admin user}
        {--email=admin@codershero.com : Email address of the admin user}
        {--password= : Password for the admin user (prompted if omitted)}
        {--role=super_admin : Role to assign (admin or super_admin)}';

    protected $description = 'Create or update an admin user with the specified role';

    public function handle(): int
    {
        $email = $this->option('email');
        $name = $this->option('name');
        $password = $this->option('password') ?: $this->secret('Enter password for the admin user');

        if (! $password || strlen($password) < 8) {
            $this->error('Password must be at least 8 characters long.');

            return self::FAILURE;
        }

        $roleName = $this->option('role');

        if (! in_array($roleName, ['admin', 'super_admin'])) {
            $this->error('Role must be either "admin" or "super_admin".');

            return self::FAILURE;
        }

        if (! Role::where('name', $roleName)->exists()) {
            $this->error("Role \"{$roleName}\" does not exist. Run \"php artisan db:seed --class=RoleSeeder\" first.");

            return self::FAILURE;
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'is_active' => true,
            ]
        );

        $user->syncRoles([$roleName]);

        $this->info("Admin user created successfully:");
        $this->table(
            ['Name', 'Email', 'Role'],
            [[$user->name, $user->email, $roleName]]
        );

        return self::SUCCESS;
    }
}
