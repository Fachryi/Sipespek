<?php
/**
 * Standardized JSON Response Helper
 * SIPESPEK - Desa Wangkar Weli
 */

function sendResponse(bool $status, string $message, $data = null, int $httpCode = 200): void {
    http_response_code($httpCode);
    echo json_encode([
        'status'  => $status,
        'message' => $message,
        'data'    => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function sendSuccess(string $message, $data = null, int $httpCode = 200): void {
    sendResponse(true, $message, $data, $httpCode);
}

function sendError(string $message, $data = null, int $httpCode = 400): void {
    sendResponse(false, $message, $data, $httpCode);
}

function sendUnauthorized(string $message = 'Akses tidak diizinkan. Silakan login terlebih dahulu.'): void {
    sendResponse(false, $message, null, 401);
}

function sendForbidden(string $message = 'Anda tidak memiliki hak akses untuk tindakan ini.'): void {
    sendResponse(false, $message, null, 403);
}

function sendNotFound(string $message = 'Data tidak ditemukan.'): void {
    sendResponse(false, $message, null, 404);
}

function sendServerError(string $message = 'Terjadi kesalahan pada server. Silakan coba lagi.'): void {
    sendResponse(false, $message, null, 500);
}

/**
 * Generate nomor permohonan otomatis
 * Format: PRM-YYYYMMDD-XXXXXX (random 6 digit)
 */
function generateNomorPermohonan(): string {
    return 'PRM-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 6));
}

/**
 * Generate nomor surat resmi otomatis
 * Format: 001/DS-WW/KTP/IX/2026
 */
function generateNomorSurat(string $kode, int $urutan): string {
    $bulanRomawi = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    $bulan = (int) date('n');
    $tahun = date('Y');
    return sprintf('%03d/DS-WW/%s/%s/%s', $urutan, strtoupper($kode), $bulanRomawi[$bulan], $tahun);
}

/**
 * Sanitize input
 */
function sanitize(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)));
}

/**
 * Get JSON body dari request
 */
function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
