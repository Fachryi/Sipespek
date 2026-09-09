<?php
/**
 * Konfigurasi Database Hosting (InfinityFree / cPanel)
 * 
 * Salin file ini menjadi 'db_config.php' jika ingin meng-override
 * koneksi lokal dengan kredensial dari InfinityFree.
 */

return [
    'host'     => 'sqlxxx.infinityfree.com', // Lihat di cPanel InfinityFree -> MySQL Details
    'dbname'   => 'epiz_xxxxxxx_sipespek',   // Nama database lengkap di InfinityFree
    'username' => 'epiz_xxxxxxx',            // Username database dari InfinityFree
    'password' => 'password_vpanel_anda',    // Password akun InfinityFree
    'charset'  => 'utf8mb4',
];
