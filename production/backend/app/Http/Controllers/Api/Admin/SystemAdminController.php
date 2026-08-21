<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class SystemAdminController extends Controller
{
    use ApiResponse;

    public function health(): JsonResponse
    {
        $connectionName = config('database.default');
        $dbHealthy = true;
        try {
            DB::connection()->getPdo();
        } catch (\Throwable) {
            $dbHealthy = false;
        }

        $logFile = storage_path('logs/laravel.log');
        $storageWritable = is_writable(storage_path()) && is_writable($logFile);

        return $this->successResponse([
            'app' => [
                'name' => config('app.name'),
                'env' => app()->environment(),
                'debug' => (bool) config('app.debug'),
                'url' => config('app.url'),
                'version' => app()->version(),
                'php_version' => PHP_VERSION,
                'timezone' => config('app.timezone'),
            ],
            'database' => [
                'connection' => $connectionName,
                'driver' => config("database.connections.{$connectionName}.driver"),
                'healthy' => $dbHealthy,
            ],
            'cache' => config('cache.default'),
            'queue' => config('queue.default'),
            'session' => config('session.driver'),
            'storage' => [
                'writable' => $storageWritable,
                'disk' => config('filesystems.default'),
            ],
            'system' => [
                'memory_used_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
                'request_time' => round((microtime(true) - (defined('LARAVEL_START') ? LARAVEL_START : microtime(true))) * 1000, 2) . ' ms',
                'server_time' => now()->toIso8601String(),
            ],
        ], 'System health retrieved successfully.');
    }
    public function logs(Request $request): JsonResponse
    {
        $logFile = storage_path('logs/laravel.log');
        if (! file_exists($logFile)) {
            return $this->successResponse(['lines' => []], 'No logs found.');
        }

        $count = min((int) $request->get('lines', 200), 2000);
        $level = $request->string('level')->toString();

        // Efficient tail: read only the last portion of the file
        $handle = fopen($logFile, 'r');
        if ($handle === false) {
            return $this->successResponse(['lines' => []], 'Unable to open log file.');
        }

        $fileSize = filesize($logFile);
        $chunkSize = min($fileSize, $count * 2048); // estimate ~1KB avg line
        fseek($handle, max(0, $fileSize - $chunkSize));
        $raw = fread($handle, $chunkSize);
        fclose($handle);

        $allLines = explode("\n", $raw);
        $tail = array_slice($allLines, -$count);

        $results = [];
        $offset = max(0, count($allLines) - count($tail));
        foreach ($tail as $i => $line) {
            if ($line === '') continue;
            if ($level && ! str_contains($line, ".$level:") && ! str_contains($line, "production.$level:")) {
                continue;
            }
            $results[] = [
                'line' => $offset + $i + 1,
                'content' => $line,
            ];
        }

        return $this->successResponse(['lines' => array_slice($results, -$count)], 'Logs retrieved successfully.');
    }

    public function backups(): JsonResponse
    {
        $backupDir = storage_path('app/backups');
        if (! is_dir($backupDir)) {
            return $this->successResponse(['backups' => []], 'No backups found.');
        }

        $backups = collect(glob($backupDir . '/*'))
            ->filter(fn ($file) => is_file($file))
            ->map(function ($file) {
                $stat = stat($file);

                return [
                    'name' => basename($file),
                    'size' => filesize($file),
                    'size_human' => $this->humanBytes(filesize($file)),
                    'created_at' => date('Y-m-d H:i:s', $stat['mtime']),
                ];
            })
            ->sortByDesc('created_at')
            ->values();

        return $this->successResponse(['backups' => $backups], 'Backups retrieved successfully.');
    }

    public function createBackup(): JsonResponse
    {
        $backupDir = storage_path('app/backups');
        if (! is_dir($backupDir) && ! mkdir($backupDir, 0755, true) && ! is_dir($backupDir)) {
            return $this->errorResponse('Unable to create backup directory.', 500);
        }

        $connection = config('database.default');
        $driver = config("database.connections.{$connection}.driver");
        $filename = 'backup-' . now()->format('Ymd-His') . '-' . Str::lower(Str::random(6));

        try {
            if ($driver === 'sqlite') {
                $dbPath = config("database.connections.{$connection}.database");
                if (Str::startsWith($dbPath, ':') && Str::endsWith($dbPath, ':')) {
                    return $this->errorResponse('In-memory databases cannot be backed up.', 422);
                }
                copy($dbPath, $backupDir . '/' . $filename . '.sqlite');
            } elseif (in_array($driver, ['mysql', 'mariadb'])) {
                $process = new Process([
                    'mysqldump',
                    '--host=' . config("database.connections.{$connection}.host"),
                    '--port=' . config("database.connections.{$connection}.port"),
                    '--user=' . config("database.connections.{$connection}.username"),
                    '--password=' . config("database.connections.{$connection}.password"),
                    config("database.connections.{$connection}.database"),
                ]);
                $process->setTimeout(120);
                $process->run();
                if (! $process->isSuccessful()) {
                    throw new ProcessFailedException($process);
                }
                file_put_contents($backupDir . '/' . $filename . '.sql', $process->getOutput());
            } else {
                return $this->errorResponse('Backup is not supported for the ' . $driver . ' driver.', 422);
            }
        } catch (ProcessFailedException $e) {
            return $this->errorResponse('Database dump failed: ' . $e->getMessage(), 500);
        } catch (\Throwable $e) {
            return $this->errorResponse('Backup failed: ' . $e->getMessage(), 500);
        }

        $file = $backupDir . '/' . $filename . ($driver === 'sqlite' ? '.sqlite' : '.sql');

        return $this->createdResponse([
            'name' => basename($file),
            'size' => filesize($file),
            'size_human' => $this->humanBytes(filesize($file)),
            'created_at' => date('Y-m-d H:i:s'),
        ], 'Backup created successfully.');
    }

    public function downloadBackup(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse | JsonResponse
    {
        $name = basename((string) $request->query('name', ''));
        if ($name === '' || ! preg_match('/^backup-\d{8}-\d{6}-[a-z0-9]+\.(sqlite|sql)$/', $name)) {
            return $this->errorResponse('Invalid backup name.', 422);
        }

        $file = storage_path('app/backups/' . $name);
        if (! file_exists($file)) {
            return $this->notFoundResponse('Backup not found.');
        }

        return response()->streamDownload(
            fn () => readfile($file),
            $name,
            ['Content-Type' => 'application/octet-stream']
        );
    }

    public function deleteBackup(Request $request): JsonResponse
    {
        $name = basename((string) $request->query('name', ''));
        if ($name === '' || ! preg_match('/^backup-\d{8}-\d{6}-[a-z0-9]+\.(sqlite|sql)$/', $name)) {
            return $this->errorResponse('Invalid backup name.', 422);
        }

        $file = storage_path('app/backups/' . $name);
        if (! file_exists($file)) {
            return $this->notFoundResponse('Backup not found.');
        }

        @unlink($file);

        return $this->noContentResponse('Backup deleted successfully.');
    }

    private function humanBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}
