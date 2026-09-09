<?php
/**
 * SIPESPEK Backend API — Router Entry Point
 * Desa Wangkar Weli
 *
 * Base URL: http://localhost/sipespek/backend/
 */

// === CORS Headers ===
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// === Autoload ===
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt_config.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/helpers/jwt.php';
require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/PendudukController.php';
require_once __DIR__ . '/controllers/PermohonanController.php';
require_once __DIR__ . '/controllers/LaporanController.php';
require_once __DIR__ . '/controllers/CetakSuratController.php';

// === Create uploads directory if needed ===
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

// === Parse Request ===
$method  = $_SERVER['REQUEST_METHOD'];
$uri     = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$baseUri = '/sipespek/backend';

// Strip base path
if (str_starts_with($uri, $baseUri)) {
    $uri = substr($uri, strlen($baseUri));
}
$uri = rtrim($uri, '/') ?: '/';

// Split URI into segments
$segments = array_values(array_filter(explode('/', $uri)));

// === Route Dispatcher ===
try {
    // --------------------------------------------------------
    // AUTH ROUTES
    // --------------------------------------------------------
    if (($segments[0] ?? '') === 'auth') {
        $ctrl = new AuthController();
        $action = $segments[1] ?? '';

        if ($action === 'register' && $method === 'POST') {
            $ctrl->register();
        } elseif ($action === 'login' && $method === 'POST') {
            $ctrl->login();
        } elseif ($action === 'profile' && $method === 'GET') {
            $ctrl->profile();
        } else {
            sendNotFound('Endpoint auth tidak ditemukan.');
        }

    // --------------------------------------------------------
    // PENDUDUK ROUTES
    // --------------------------------------------------------
    } elseif (($segments[0] ?? '') === 'penduduk') {
        $ctrl = new PendudukController();
        $id   = isset($segments[1]) && is_numeric($segments[1]) ? (int) $segments[1] : null;

        if ($id === null) {
            match ($method) {
                'GET'  => $ctrl->index(),
                'POST' => $ctrl->store(),
                default => sendError('Method not allowed.', null, 405),
            };
        } else {
            match ($method) {
                'GET'    => $ctrl->show($id),
                'PUT'    => $ctrl->update($id),
                'DELETE' => $ctrl->destroy($id),
                default  => sendError('Method not allowed.', null, 405),
            };
        }

    // --------------------------------------------------------
    // JENIS SURAT ROUTES
    // --------------------------------------------------------
    } elseif (($segments[0] ?? '') === 'jenis-surat') {
        $ctrl = new PermohonanController();
        $ctrl->jenisSurat();

    // --------------------------------------------------------
    // PERMOHONAN ROUTES
    // --------------------------------------------------------
    } elseif (($segments[0] ?? '') === 'permohonan') {
        $ctrl = new PermohonanController();
        $sub  = $segments[1] ?? null;

        if ($sub === 'all' && $method === 'GET') {
            $ctrl->all();
        } elseif ($sub === null && $method === 'GET') {
            $ctrl->myPermohonan();
        } elseif ($sub === null && $method === 'POST') {
            $ctrl->store();
        } elseif (is_numeric($sub)) {
            $id     = (int) $sub;
            $action = $segments[2] ?? null;

            if ($action === 'verifikasi' && $method === 'PUT') {
                $ctrl->verifikasi($id);
            } elseif ($action === 'approve' && $method === 'PUT') {
                $ctrl->approve($id);
            } elseif ($action === null && $method === 'GET') {
                $ctrl->show($id);
            } else {
                sendNotFound('Endpoint permohonan tidak ditemukan.');
            }
        } else {
            sendNotFound('Endpoint permohonan tidak ditemukan.');
        }

    // --------------------------------------------------------
    // LAPORAN ROUTES
    // --------------------------------------------------------
    } elseif (($segments[0] ?? '') === 'laporan') {
        $ctrl   = new LaporanController();
        $action = $segments[1] ?? '';

        match ($action) {
            'statistik' => $ctrl->statistik(),
            'rekap'     => $ctrl->rekap(),
            'chart'     => $ctrl->chart(),
            default     => sendNotFound('Endpoint laporan tidak ditemukan.'),
        };

    // --------------------------------------------------------
    // CETAK SURAT ROUTES
    // --------------------------------------------------------
    } elseif (($segments[0] ?? '') === 'cetak') {
        $ctrl = new CetakSuratController();
        $id   = isset($segments[1]) && is_numeric($segments[1]) ? (int) $segments[1] : null;

        if ($id && $method === 'GET') {
            $ctrl->cetak($id);
        } else {
            sendNotFound('ID permohonan tidak valid.');
        }

    // --------------------------------------------------------
    // HEALTH CHECK
    // --------------------------------------------------------
    } elseif ($uri === '/' || $uri === '') {
        sendSuccess('SIPESPEK API berjalan dengan baik.', [
            'app'     => APP_NAME,
            'desa'    => DESA_NAME,
            'version' => '1.0.0',
            'time'    => date('Y-m-d H:i:s'),
        ]);

    } else {
        sendNotFound('Endpoint tidak ditemukan: ' . $uri);
    }

} catch (PDOException $e) {
    sendServerError('Database error: ' . $e->getMessage());
} catch (Throwable $e) {
    sendServerError('Server error: ' . $e->getMessage());
}
