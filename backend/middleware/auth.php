<?php
/**
 * Auth Middleware - JWT Verification & RBAC
 * SIPESPEK - Desa Wangkar Weli
 */

class AuthMiddleware {
    private static ?object $currentUser = null;

    /**
     * Wajib autentikasi - return user payload atau stop dengan 401
     */
    public static function authenticate(): object {
        $token = JWTHelper::getBearerToken();

        if (!$token) {
            sendUnauthorized('Token tidak ditemukan. Silakan login terlebih dahulu.');
        }

        $decoded = JWTHelper::decode($token);

        if (!$decoded) {
            sendUnauthorized('Token tidak valid atau sudah kadaluarsa. Silakan login kembali.');
        }

        self::$currentUser = $decoded;
        return $decoded;
    }

    /**
     * Cek role yang diizinkan
     * @param string|array $roles - Role yang diizinkan
     */
    public static function requireRole($roles): object {
        $user = self::authenticate();

        $allowedRoles = is_array($roles) ? $roles : [$roles];

        if (!in_array($user->role, $allowedRoles)) {
            sendForbidden('Anda tidak memiliki hak akses untuk tindakan ini. Role yang dibutuhkan: ' . implode(' atau ', $allowedRoles));
        }

        return $user;
    }

    /**
     * Get current authenticated user (setelah authenticate() dipanggil)
     */
    public static function getCurrentUser(): ?object {
        return self::$currentUser;
    }
}
