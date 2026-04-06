<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\DbDumper\Databases\MySql;

class BackupController extends Controller
{
    /**
     * Display backup management page
     */
    public function index(Request $request)
    {
        $backups = $this->getBackups($request);

        return Inertia::render('settings/Backup', [
            'backups' => $backups['data'],
            'pagination' => [
                'current_page' => $backups['current_page'],
                'last_page' => $backups['last_page'],
                'per_page' => $backups['per_page'],
                'total' => $backups['total'],
            ],
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

            // Create backup using mysqldump with drop table statements
            $command = sprintf(
                'mysqldump --user=%s --password=%s --host=%s --port=%s --add-drop-table --routines --triggers %s > "%s" 2>&1',
                escapeshellarg($username),
                escapeshellarg($password),
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($database),
                $backupPath
            );

            exec($command, $output, $returnCode);

            if ($returnCode !== 0) {
                Log::error('Backup creation failed', [
                    'return_code' => $returnCode,
                    'output' => $output,
                ]);
                throw new \Exception('Failed to create database backup: ' . implode('\n', $output));
            }

            // Verify file was created and has content
            if (! File::exists($backupPath) || File::size($backupPath) === 0) {
                throw new \Exception('Backup file was not created or is empty');
            }

            Log::info('Backup created successfully', [
                'file' => $fileName,
                'size' => File::size($backupPath),
            ]);

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

        if (! File::exists($path)) {
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

        if (! File::exists($path)) {
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

            if (! File::exists($backupPath)) {
                Log::error('Backup file not found: ' . $backupPath);
                return back()->with('error', 'Backup file not found');
            }

            // Get database credentials
            $host = config('database.connections.mysql.host');
            $port = config('database.connections.mysql.port');
            $database = config('database.connections.mysql.database');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');

            Log::info('Starting database restore', [
                'file' => $fileName,
                'database' => $database,
                'host' => $host,
            ]);

            // Read the SQL file content
            $sqlContent = File::get($backupPath);

            if (empty($sqlContent)) {
                throw new \Exception('Backup file is empty');
            }

            Log::info('SQL file loaded', [
                'size' => strlen($sqlContent),
                'first_100_chars' => substr($sqlContent, 0, 100),
            ]);

            // Build mysql command without redirect
            $mysqlPath = 'mysql'; // Try from PATH first

            // For Windows, check common MySQL paths
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                $possiblePaths = [
                    'C:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysql.exe',
                    'C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysql.exe',
                    'C:\\xampp\\mysql\\bin\\mysql.exe',
                    'C:\\wamp\\bin\\mysql\\mysql8.0.27\\bin\\mysql.exe',
                ];

                foreach ($possiblePaths as $path) {
                    if (file_exists($path)) {
                        $mysqlPath = $path;
                        break;
                    }
                }
            }

            // Create a temporary file for error output
            $errorFile = tempnam(sys_get_temp_dir(), 'mysql_error_');

            // Build command using proc_open for better control
            $descriptorspec = [
                0 => ['pipe', 'r'],  // stdin
                1 => ['pipe', 'w'],  // stdout
                2 => ['file', $errorFile, 'w'],  // stderr
            ];

            $process = proc_open(
                sprintf(
                    '%s --user=%s --password=%s --host=%s --port=%s --force %s',
                    escapeshellarg($mysqlPath),
                    escapeshellarg($username),
                    escapeshellarg($password),
                    escapeshellarg($host),
                    escapeshellarg($port),
                    escapeshellarg($database)
                ),
                $descriptorspec,
                $pipes
            );

            if (is_resource($process)) {
                // Write SQL content to stdin
                fwrite($pipes[0], $sqlContent);
                fclose($pipes[0]);

                // Read output
                $output = stream_get_contents($pipes[1]);
                fclose($pipes[1]);

                // Close process and get return code
                $returnCode = proc_close($process);

                // Read error output
                $errorOutput = file_exists($errorFile) ? file_get_contents($errorFile) : '';

                // Clean up temp file
                @unlink($errorFile);

                Log::info('MySQL restore command executed', [
                    'return_code' => $returnCode,
                    'output_length' => strlen($output ?? ''),
                    'error_output' => $errorOutput,
                ]);

                if ($returnCode !== 0) {
                    Log::error('Database restore failed', [
                        'return_code' => $returnCode,
                        'error' => $errorOutput,
                    ]);
                    throw new \Exception('Failed to restore database: ' . $errorOutput);
                }
            } else {
                throw new \Exception('Failed to start MySQL process');
            }

            // Verify restore by checking table count
            $verifyCommand = sprintf(
                'mysql --user=%s --password=%s --host=%s --port=%s %s -e "SHOW TABLES;" 2>&1',
                escapeshellarg($username),
                escapeshellarg($password),
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($database)
            );

            exec($verifyCommand, $verifyOutput, $verifyReturnCode);

            Log::info('Database verification', [
                'tables_found' => count($verifyOutput) - 1, // Subtract header row
                'return_code' => $verifyReturnCode,
            ]);

            // Clear all Laravel caches
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('view:clear');
            Artisan::call('event:clear');
            Artisan::call('route:clear');

            // Disconnect database to force fresh connection
            DB::disconnect();

            Log::info('Database restore completed successfully');

            return back()->with('success', 'Database restored successfully! The page will reload with fresh data.');
        } catch (\Exception $e) {
            Log::error('Database restore exception: ' . $e->getMessage());
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

            Log::info('Starting upload restore', [
                'file' => $fileName,
                'database' => $database,
            ]);

            // Read the SQL file content
            $sqlContent = File::get($tempPath);

            if (empty($sqlContent)) {
                File::delete($tempPath);
                throw new \Exception('Uploaded backup file is empty');
            }

            // Build mysql command without redirect
            $mysqlPath = 'mysql'; // Try from PATH first

            // For Windows, check common MySQL paths
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                $possiblePaths = [
                    'C:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysql.exe',
                    'C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysql.exe',
                    'C:\\xampp\\mysql\\bin\\mysql.exe',
                    'C:\\wamp\\bin\\mysql\\mysql8.0.27\\bin\\mysql.exe',
                ];

                foreach ($possiblePaths as $path) {
                    if (file_exists($path)) {
                        $mysqlPath = $path;
                        break;
                    }
                }
            }

            // Create a temporary file for error output
            $errorFile = tempnam(sys_get_temp_dir(), 'mysql_error_');

            // Build command using proc_open for better control
            $descriptorspec = [
                0 => ['pipe', 'r'],  // stdin
                1 => ['pipe', 'w'],  // stdout
                2 => ['file', $errorFile, 'w'],  // stderr
            ];

            $process = proc_open(
                sprintf(
                    '%s --user=%s --password=%s --host=%s --port=%s --force %s',
                    escapeshellarg($mysqlPath),
                    escapeshellarg($username),
                    escapeshellarg($password),
                    escapeshellarg($host),
                    escapeshellarg($port),
                    escapeshellarg($database)
                ),
                $descriptorspec,
                $pipes
            );

            if (is_resource($process)) {
                // Write SQL content to stdin
                fwrite($pipes[0], $sqlContent);
                fclose($pipes[0]);

                // Read output
                $output = stream_get_contents($pipes[1]);
                fclose($pipes[1]);

                // Close process and get return code
                $returnCode = proc_close($process);

                // Read error output
                $errorOutput = file_exists($errorFile) ? file_get_contents($errorFile) : '';

                // Clean up temp files
                @unlink($errorFile);
                File::delete($tempPath);

                Log::info('Upload restore executed', [
                    'return_code' => $returnCode,
                    'error_output' => $errorOutput,
                ]);

                if ($returnCode !== 0) {
                    Log::error('Upload restore failed', [
                        'return_code' => $returnCode,
                        'error' => $errorOutput,
                    ]);
                    throw new \Exception('Failed to restore database: ' . $errorOutput);
                }
            } else {
                File::delete($tempPath);
                throw new \Exception('Failed to start MySQL process');
            }

            // Clear all Laravel caches
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('view:clear');
            Artisan::call('event:clear');
            Artisan::call('route:clear');

            // Disconnect database to force fresh connection
            DB::disconnect();

            Log::info('Upload restore completed successfully');

            return back()->with('success', 'Database restored from uploaded file successfully! The page will reload with fresh data.');
        } catch (\Exception $e) {
            Log::error('Upload restore exception: ' . $e->getMessage());
            return back()->with('error', 'Failed to restore database: ' . $e->getMessage());
        }
    }

    /**
     * Get list of available backups
     */
    private function getBackups(Request $request): array
    {
        $backupDir = storage_path('app/backups');

        if (! File::exists($backupDir)) {
            return [
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 15,
                'total' => 0,
            ];
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

        // Filter by date range
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if ($startDate) {
            $backups = array_filter($backups, function ($backup) use ($startDate) {
                return strtotime($backup['date']) >= strtotime($startDate . ' 00:00:00');
            });
        }

        if ($endDate) {
            $backups = array_filter($backups, function ($backup) use ($endDate) {
                return strtotime($backup['date']) <= strtotime($endDate . ' 23:59:59');
            });
        }

        // Re-index after filtering
        $backups = array_values($backups);

        // Pagination
        $perPage = 15;
        $currentPage = (int) $request->input('page', 1);
        $total = count($backups);
        $lastPage = (int) ceil($total / $perPage);

        if ($currentPage < 1) {
            $currentPage = 1;
        }
        if ($currentPage > $lastPage && $lastPage > 0) {
            $currentPage = $lastPage;
        }

        $offset = ($currentPage - 1) * $perPage;
        $paginatedBackups = array_slice($backups, $offset, $perPage);

        return [
            'data' => $paginatedBackups,
            'current_page' => $currentPage,
            'last_page' => $lastPage,
            'per_page' => $perPage,
            'total' => $total,
        ];
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
