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

                    // Auto-seed warga & penduduk jika belum ada warga di tabel users
                    $wargaCount = (int)self::$instance->query("SELECT COUNT(*) FROM users WHERE role = 'warga'")->fetchColumn();
                    if ($wargaCount === 0) {
                        self::$instance->exec("
                            INSERT IGNORE INTO `penduduk` (`id`, `nik`, `no_kk`, `nama`, `tempat_lahir`, `tanggal_lahir`, `jenis_kelamin`, `alamat`, `rt_rw`, `dusun`, `agama`, `status_perkawinan`, `pekerjaan`, `no_hp`) VALUES
                            (1,'7301010101010001','7301011234567001','Budi Santoso','Wangkar Weli','1990-05-15','L','Jl. Desa Wangkar Weli No. 1','001/001','Dusun I','Islam','Kawin','Petani','082111111111'),
                            (2,'7301010101010002','7301011234567002','Siti Rahayu','Wangkar Weli','1995-08-20','P','Jl. Desa Wangkar Weli No. 2','001/002','Dusun II','Islam','Belum Kawin','Buruh','082222222222'),
                            (3,'7301010101010003','7301011234567003','Ahmad Fauzi','Manado','1985-03-10','L','Jl. Desa Wangkar Weli No. 3','002/001','Dusun I','Kristen','Kawin','Wiraswasta','082333333333');
                        ");

                        self::$instance->exec("
                            INSERT IGNORE INTO `users` (`id`, `nik`, `username`, `password`, `nama_lengkap`, `no_hp`, `alamat`, `role`, `is_active`) VALUES
                            (3,'7301010101010003','ahmadfauzi','$2y$10$nmNzozbTgNZ7JdwxHLt9t.Rg8j8HFGPWZ4aTDJPZSXOJFg5VqlF6y','Ahmad Fauzi','082333333333','Jln Wengkar Weli 2','warga',1),
                            (4,'7301010101010001','budisantoso','$2y$10$nmNzozbTgNZ7JdwxHLt9t.Rg8j8HFGPWZ4aTDJPZSXOJFg5VqlF6y','Budi Santoso','082111111111','Jl. Desa Wangkar Weli No. 1','warga',1),
                            (5,'7301010101010002','sitirahayu','$2y$10$nmNzozbTgNZ7JdwxHLt9t.Rg8j8HFGPWZ4aTDJPZSXOJFg5VqlF6y','Siti Rahayu','082222222222','Jl. Desa Wangkar Weli No. 2','warga',1);
                        ");
                    }

                    // Pastikan semua user warga memiliki password hash 'warga123' yang valid
                    $wargaHash = '$2y$10$nmNzozbTgNZ7JdwxHLt9t.Rg8j8HFGPWZ4aTDJPZSXOJFg5VqlF6y';
                    self::$instance->exec("
                        UPDATE `users` 
                        SET `password` = '{$wargaHash}', `is_active` = 1 
                        WHERE `role` = 'warga' AND (`password` = 'warga123' OR `password` NOT LIKE '\$2y\$%')
                    ");
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
