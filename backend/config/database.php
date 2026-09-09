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
            $dbname   = 'sipespek_db';
            $username = 'root';
            $password = '';
            $charset  = 'utf8mb4';

            // Override jika ada file konfigurasi khusus hosting / InfinityFree
            $customConfig = __DIR__ . '/db_config.php';
            if (file_exists($customConfig)) {
                $cfg = require $customConfig;
                $host     = $cfg['host']     ?? $host;
                $dbname   = $cfg['dbname']   ?? $dbname;
                $username = $cfg['username'] ?? $username;
                $password = $cfg['password'] ?? $password;
                $charset  = $cfg['charset']  ?? $charset;
            } elseif (getenv('DB_HOST')) {
                $host     = getenv('DB_HOST');
                $dbname   = getenv('DB_NAME') ?: $dbname;
                $username = getenv('DB_USER') ?: $username;
                $password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : $password;
            }

            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=%s',
                $host,
                $dbname,
                $charset
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, self::$username, self::$password, $options);
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
