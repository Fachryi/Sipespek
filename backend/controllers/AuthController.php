<?php
/**
 * AuthController - Register, Login, Profile
 * SIPESPEK - Desa Wangkar Weli
 */

class AuthController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * POST /auth/register
     * Registrasi akun warga baru
     */
    public function register(): void {
        $body = getJsonBody();

        $required = ['nik', 'username', 'password', 'nama_lengkap', 'no_hp', 'alamat'];
        foreach ($required as $field) {
            if (empty($body[$field])) {
                sendError("Field '{$field}' wajib diisi.");
            }
        }

        $nik          = sanitize($body['nik']);
        $username     = sanitize($body['username']);
        $password     = $body['password'];
        $nama_lengkap = sanitize($body['nama_lengkap']);
        $no_hp        = sanitize($body['no_hp']);
        $alamat       = sanitize($body['alamat']);

        // Validasi NIK 16 digit
        if (!preg_match('/^\d{16}$/', $nik)) {
            sendError('NIK harus 16 digit angka.');
        }

        // Validasi password min 6 karakter
        if (strlen($password) < 6) {
            sendError('Password minimal 6 karakter.');
        }

        // Cek NIK atau username sudah ada
        $stmt = $this->db->prepare('SELECT id FROM users WHERE nik = ? OR username = ?');
        $stmt->execute([$nik, $username]);
        if ($stmt->fetch()) {
            sendError('NIK atau username sudah terdaftar.', null, 409);
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

        $stmt = $this->db->prepare(
            'INSERT INTO users (nik, username, password, nama_lengkap, no_hp, alamat, role) VALUES (?, ?, ?, ?, ?, ?, "warga")'
        );
        $stmt->execute([$nik, $username, $hashedPassword, $nama_lengkap, $no_hp, $alamat]);

        $userId = $this->db->lastInsertId();

        sendSuccess('Registrasi berhasil! Silakan login untuk melanjutkan.', [
            'id'           => (int) $userId,
            'username'     => $username,
            'nama_lengkap' => $nama_lengkap,
            'role'         => 'warga'
        ], 201);
    }

    /**
     * POST /auth/login
     * Login semua role
     */
    public function login(): void {
        $body = getJsonBody();

        if (empty($body['username']) || empty($body['password'])) {
            sendError('Username dan password wajib diisi.');
        }

        $loginInput = trim(sanitize($body['username']));
        $password   = trim((string)$body['password']);

        $stmt = $this->db->prepare(
            'SELECT id, nik, username, password, nama_lengkap, no_hp, alamat, role, is_active 
             FROM users 
             WHERE LOWER(username) = LOWER(?) OR nik = ?'
        );
        $stmt->execute([$loginInput, $loginInput]);
        $user = $stmt->fetch();

        if (!$user) {
            sendError('Username atau password salah.', null, 401);
        }

        if (!$user['is_active']) {
            sendError('Akun Anda telah dinonaktifkan. Hubungi Administrator.', null, 403);
        }

        // Verifikasi password (dukung hash bcrypt maupun plain text fallback)
        $passwordValid = password_verify($password, $user['password']) || $user['password'] === $password;

        if (!$passwordValid) {
            sendError('Username atau password salah.', null, 401);
        }

        // Jika password di database berupa plain text, re-hash secara otomatis ke bcrypt
        if ($user['password'] === $password) {
            $newHash = password_hash($password, PASSWORD_BCRYPT);
            $upStmt = $this->db->prepare('UPDATE users SET password = ? WHERE id = ?');
            $upStmt->execute([$newHash, $user['id']]);
        }

        $payload = [
            'id'           => (int) $user['id'],
            'nik'          => $user['nik'],
            'username'     => $user['username'],
            'nama_lengkap' => $user['nama_lengkap'],
            'role'         => $user['role'],
        ];

        $token = JWTHelper::encode($payload);

        sendSuccess('Login berhasil!', [
            'token' => $token,
            'user'  => $payload,
        ]);
    }

    /**
     * GET /auth/profile
     * Mendapatkan profil user yang sedang login
     */
    public function profile(): void {
        $authUser = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare(
            'SELECT id, nik, username, nama_lengkap, no_hp, alamat, role, created_at FROM users WHERE id = ?'
        );
        $stmt->execute([$authUser->id]);
        $user = $stmt->fetch();

        if (!$user) {
            sendNotFound('Akun tidak ditemukan.');
        }

        sendSuccess('Profil berhasil dimuat.', $user);
    }
}
