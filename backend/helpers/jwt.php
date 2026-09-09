<?php
/**
 * JWT Helper - Wrapper for Firebase JWT
 * SIPESPEK - Desa Wangkar Weli
 */

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTHelper {
    /**
     * Generate JWT token untuk user
     */
    public static function encode(array $payload): string {
        $issuedAt = time();
        $data = array_merge($payload, [
            'iat' => $issuedAt,
            'exp' => $issuedAt + JWT_EXPIRE,
            'iss' => APP_NAME,
        ]);

        return JWT::encode($data, JWT_SECRET_KEY, JWT_ALGORITHM);
    }

    /**
     * Decode dan verifikasi JWT token
     * Returns decoded payload atau null jika invalid/expired
     */
    public static function decode(string $token): ?object {
        try {
            $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, JWT_ALGORITHM));
            return $decoded;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Ambil token dari Authorization header
     */
    public static function getBearerToken(): ?string {
        $headers = null;

        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER['Authorization']);
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(
                array_map('ucwords', array_keys($requestHeaders)),
                array_values($requestHeaders)
            );
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        if (!empty($headers) && preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
