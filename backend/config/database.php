<?php
/**
 * Database Configuration - PDO MySQL Singleton
 * SIPESPEK - Desa Wangkar Weli
 */

class Database {
    private static ?PDO $instance = null;

    private static string $host     = 'localhost';
    private static string $dbname   = 'sipespek_db';
    private static string $username = 'root';
    private static string $password = '';
    private static string $charset  = 'utf8mb4';

    /**
     * Get PDO singleton instance
     */
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=%s',
                self::$host,
                self::$dbname,
                self::$charset
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
