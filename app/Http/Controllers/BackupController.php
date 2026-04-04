<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Spatie\DbDumper\Databases\MySql;

class BackupController extends Controller
{
    /**
     * Display backup management page
     */
    public function index()
    {
        $backups = $this->getBackups();

        return Inertia::render('settings/Backup', [
            'backups' => $backups,
            'databaseName' => config('database.connections.mysql.database'),
        ]);
    }

    /**
     * Create a new database backup
     */
    public function create(Request $request)
    {
        try {
            $timestamp = now()->format('Y-m-d_H-i-s');
            $fileName = "backup_{$timestamp}.sql";
            $backupPath = storage_path("app/backups/{$fileName}");

            // Ensure backup directory exists
            File::ensureDirectoryExists(storage_path('app/backups'));

            // Get database credentials
            $host = config('database.connections.mysql.host');
            $port = config('database.connections.mysql.port');
            $database = config('database.connections.mysql.database');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');

            // Create backup using mysqldump
            $command = sprintf(
                'mysqldump --user=%s --password=%s --host=%s --port=%s %s > "%s"',
                escapeshellarg($username),
                escapeshellarg($password),
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($database),
                $backupPath
            );

            exec($command, $output, $returnCode);

            if ($returnCode !== 0) {
                throw new \Exception('Failed to create database backup');
            }

            // Verify file was created
            if (!File::exists($backupPath)) {
                throw new \Exception('Backup file was not created');
            }

            return redirect()->back()->with('success', 'Database backup created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create backup: ' . $e->getMessage());
        }
    }

    /**
     * Download a backup file
     */
    public function download($fileName)
    {
        $path = storage_path("app/backups/{$fileName}");

        if (!File::exists($path)) {
            return back()->with('error', 'Backup file not found');
        }

        return response()->download($path);
    }

    /**
     * Delete a backup file
     */
    public function destroy($fileName)
    {
        $path = storage_path("app/backups/{$fileName}");

        if (!File::exists($path)) {
            return back()->with('error', 'Backup file not found');
        }

        File::delete($path);

        return back()->with('success', 'Backup deleted successfully!');
    }

    /**
     * Restore database from backup
     */
    public function restore(Request $request)
    {
        $request->validate([
            'file_name' => 'required|string',
        ]);

        try {
            $fileName = $request->input('file_name');
            $backupPath = storage_path("app/backups/{$fileName}");

            if (!File::exists($backupPath)) {
                return back()->with('error', 'Backup file not found');
            }

            // Get database credentials
            $host = config('database.connections.mysql.host');
            $port = config('database.connections.mysql.port');
            $database = config('database.connections.mysql.database');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');

            // Restore database using mysql command
            $command = sprintf(
                'mysql --user=%s --password=%s --host=%s --port=%s %s < "%s"',
                escapeshellarg($username),
                escapeshellarg($password),
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($database),
                $backupPath
            );

            exec($command, $output, $returnCode);

            if ($returnCode !== 0) {
                throw new \Exception('Failed to restore database');
            }

            return back()->with('success', 'Database restored successfully! Please refresh the page.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to restore database: ' . $e->getMessage());
        }
    }

    /**
     * Upload and restore from uploaded file
     */
    public function uploadRestore(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|file|mimes:sql,zip,gz|max:102400', // Max 100MB
        ]);

        try {
            $file = $request->file('backup_file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $tempPath = storage_path("app/temp/{$fileName}");

            // Ensure temp directory exists
            File::ensureDirectoryExists(storage_path('app/temp'));

            // Move uploaded file
            $file->move(storage_path('app/temp'), $fileName);

            // Get database credentials
            $host = config('database.connections.mysql.host');
            $port = config('database.connections.mysql.port');
            $database = config('database.connections.mysql.database');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');

            // Restore database
            $command = sprintf(
                'mysql --user=%s --password=%s --host=%s --port=%s %s < "%s"',
                escapeshellarg($username),
                escapeshellarg($password),
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($database),
                $tempPath
            );

            exec($command, $output, $returnCode);

            // Clean up temp file
            File::delete($tempPath);

            if ($returnCode !== 0) {
                throw new \Exception('Failed to restore database from uploaded file');
            }

            return back()->with('success', 'Database restored from uploaded file successfully! Please refresh the page.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to restore database: ' . $e->getMessage());
        }
    }

    /**
     * Get list of available backups
     */
    private function getBackups(): array
    {
        $backupDir = storage_path('app/backups');

        if (!File::exists($backupDir)) {
            return [];
        }

        $files = File::files($backupDir);
        $backups = [];

        foreach ($files as $file) {
            $backups[] = [
                'name' => $file->getFilename(),
                'size' => $this->formatFileSize($file->getSize()),
                'date' => date('Y-m-d H:i:s', $file->getMTime()),
                'path' => $file->getPathname(),
            ];
        }

        // Sort by date (newest first)
        usort($backups, function ($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return $backups;
    }

    /**
     * Format file size to human readable format
     */
    private function formatFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
