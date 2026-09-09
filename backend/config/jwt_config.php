<?php
/**
 * JWT Configuration
 * SIPESPEK - Desa Wangkar Weli
 */

define('JWT_SECRET_KEY', 'sipespek_wangkar_weli_2026_jwt_secret_key_super_secure_!@#');
define('JWT_ALGORITHM',  'HS256');
define('JWT_EXPIRE',     86400); // 24 jam dalam detik

// Upload Configuration
define('UPLOAD_DIR',     __DIR__ . '/../uploads/');
define('UPLOAD_MAX_SIZE', 2 * 1024 * 1024); // 2MB
define('UPLOAD_ALLOWED_TYPES', ['image/jpeg', 'image/png', 'application/pdf']);

// App Info
define('APP_NAME',    'SIPESPEK');
define('DESA_NAME',   'Desa Wangkar Weli');
define('DESA_ALAMAT', 'Kecamatan Wori, Kabupaten Minahasa Utara, Sulawesi Utara');
define('DESA_TELP',   '(0431) XXXXXX');
define('KADES_NAME',  'Kepala Desa Wangkar Weli');
