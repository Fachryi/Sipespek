<?php
/**
 * Database Configuration - PDO MySQL Singleton
 * SIPESPEK - Desa Wangkar Weli
 */

class Database {
    private static ?PDO $instance = null;

    /**
     * Get PDO singleton instance
     */
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            // Default lokal (XAMPP)
            $host     = 'localhost';
            $port     = '3306';
            $dbname   = 'sipespek_db';
            $username = 'root';
            $password = '';
            $charset  = 'utf8mb4';

            // 1. Dukungan otomatis Railway / Docker environment variables
            if (getenv('MYSQLHOST') || getenv('DB_HOST')) {
                $host     = getenv('MYSQLHOST') ?: getenv('DB_HOST');
                $port     = getenv('MYSQLPORT') ?: (getenv('DB_PORT') ?: '3306');
                $dbname   = getenv('MYSQLDATABASE') ?: (getenv('DB_NAME') ?: $dbname);
                $username = getenv('MYSQLUSER') ?: (getenv('DB_USER') ?: $username);
                $password = getenv('MYSQLPASSWORD') !== false ? getenv('MYSQLPASSWORD') : (getenv('DB_PASS') !== false ? getenv('DB_PASS') : $password);
            } elseif (getenv('MYSQL_URL')) {
                // Format: mysql://user:password@host:port/database
                $dbParts = parse_url(getenv('MYSQL_URL'));
                $host     = $dbParts['host'] ?? $host;
                $port     = (string)($dbParts['port'] ?? $port);
                $username = $dbParts['user'] ?? $username;
                $password = $dbParts['pass'] ?? $password;
                $dbname   = ltrim($dbParts['path'] ?? $dbname, '/');
            } else {
                // 2. Override opsional jika ada file config lokal
                $customConfig = __DIR__ . '/db_config.php';
                if (file_exists($customConfig)) {
                    $cfg = require $customConfig;
                    $host     = $cfg['host']     ?? $host;
                    $port     = (string)($cfg['port'] ?? $port);
                    $dbname   = $cfg['dbname']   ?? $dbname;
                    $username = $cfg['username'] ?? $username;
                    $password = $cfg['password'] ?? $password;
                    $charset  = $cfg['charset']  ?? $charset;
                }
            }

            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                $host,
                $port,
                $dbname,
                $charset
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, $username, $password, $options);

                // Auto-init schema jika database masih kosong (sangat membantu di Railway / Cloud)
                try {
                    $check = self::$instance->query("SHOW TABLES LIKE 'users'");
                    if ($check && $check->rowCount() === 0) {
                        $candidates = [
                            __DIR__ . '/../../database/schema.sql',
                            __DIR__ . '/../database/schema.sql',
                            '/var/www/html/database/schema.sql',
                        ];
                        foreach ($candidates as $file) {
                            if (file_exists($file)) {
                                $sql = file_get_contents($file);
                                self::$instance->exec($sql);
                                break;
                            }
                        }
                    }
                } catch (\Throwable $t) {
                    // Abaikan jika auto-migration gagal
                }
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode([
                    'status'  => false,
                    'message' => 'Koneksi database gagal: ' . $e->getMessage(),
                    'data'    => null
                ]);
                exit;
            }
        }

        return self::$instance;
    }

    // Prevent instantiation
    private function __construct() {}
    private function __clone() {}
}
