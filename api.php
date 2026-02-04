<?php
// ================================================
// API.PHP - Haber Yönetim API'si
// ================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// OPTIONS request'lerine cevap ver
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ================================================
// DATABASE BAĞLANTISI
// ================================================

// SQLite database dosyası
$dbFile = __DIR__ . '/news.db';
$dbExists = file_exists($dbFile);

try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Veritabanı oluştur (ilk çalıştırmada)
    if (!$dbExists) {
        createTables($db);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database hatası: ' . $e->getMessage()]);
    exit();
}

// ================================================
// TABLOLAR OLUŞTUR
// ================================================

function createTables($db) {
    $db->exec("
        CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            summary TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT DEFAULT 'Duyuru',
            image TEXT,
            author TEXT DEFAULT 'Admin',
            date TEXT DEFAULT CURRENT_DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");
}

// ================================================
// REQUEST KONTROL
// ================================================

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace('/KODE/api.php', '', $path);

// ================================================
// ROUTING
// ================================================

try {
    // GET /api - Tüm haberleri getir
    if ($method === 'GET' && $path === '') {
        getAllNews($db);
    }
    // GET /api/1 - Belirli haberi getir
    elseif ($method === 'GET' && preg_match('#^/(\d+)$#', $path, $matches)) {
        getNewsById($db, $matches[1]);
    }
    // POST /api - Yeni haber ekle
    elseif ($method === 'POST' && $path === '') {
        createNews($db);
    }
    // PUT /api/1 - Haber güncelle
    elseif ($method === 'PUT' && preg_match('#^/(\d+)$#', $path, $matches)) {
        updateNews($db, $matches[1]);
    }
    // DELETE /api/1 - Haber sil
    elseif ($method === 'DELETE' && preg_match('#^/(\d+)$#', $path, $matches)) {
        deleteNews($db, $matches[1]);
    }
    // 404
    else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint bulunamadı']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// ================================================
// FONKSIYONLAR
// ================================================

/**
 * Tüm haberleri getir
 */
function getAllNews($db) {
    $stmt = $db->query("SELECT * FROM news ORDER BY date DESC, created_at DESC");
    $news = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // ID'yi integer olarak döndür
    foreach ($news as &$item) {
        $item['id'] = (int)$item['id'];
    }
    
    http_response_code(200);
    echo json_encode($news);
}

/**
 * Belirli haberi getir
 */
function getNewsById($db, $id) {
    $stmt = $db->prepare("SELECT * FROM news WHERE id = ?");
    $stmt->execute([$id]);
    $news = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$news) {
        http_response_code(404);
        echo json_encode(['error' => 'Haber bulunamadı']);
        return;
    }
    
    $news['id'] = (int)$news['id'];
    http_response_code(200);
    echo json_encode($news);
}

/**
 * Yeni haber ekle
 */
function createNews($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validasyon
    if (!isset($input['title']) || empty(trim($input['title']))) {
        http_response_code(400);
        echo json_encode(['error' => 'Başlık boş olamaz']);
        return;
    }
    
    if (!isset($input['summary']) || empty(trim($input['summary']))) {
        http_response_code(400);
        echo json_encode(['error' => 'Özet boş olamaz']);
        return;
    }
    
    if (!isset($input['content']) || empty(trim($input['content']))) {
        http_response_code(400);
        echo json_encode(['error' => 'İçerik boş olamaz']);
        return;
    }
    
    if (!isset($input['image']) || empty(trim($input['image']))) {
        http_response_code(400);
        echo json_encode(['error' => 'Görsel URL boş olamaz']);
        return;
    }
    
    $title = $input['title'];
    $summary = $input['summary'];
    $content = $input['content'];
    $category = $input['category'] ?? 'Duyuru';
    $image = $input['image'];
    $author = $input['author'] ?? 'Admin';
    $date = $input['date'] ?? date('Y-m-d');
    
    $stmt = $db->prepare("
        INSERT INTO news (title, summary, content, category, image, author, date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([$title, $summary, $content, $category, $image, $author, $date]);
    
    $id = $db->lastInsertId();
    
    http_response_code(201);
    echo json_encode([
        'id' => (int)$id,
        'title' => $title,
        'summary' => $summary,
        'content' => $content,
        'category' => $category,
        'image' => $image,
        'author' => $author,
        'date' => $date,
        'message' => 'Haber başarıyla eklendi'
    ]);
}

/**
 * Haber güncelle
 */
function updateNews($db, $id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Haberi kontrol et
    $stmt = $db->prepare("SELECT id FROM news WHERE id = ?");
    $stmt->execute([$id]);
    
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Haber bulunamadı']);
        return;
    }
    
    // Validasyon
    if (isset($input['title']) && empty(trim($input['title']))) {
        http_response_code(400);
        echo json_encode(['error' => 'Başlık boş olamaz']);
        return;
    }
    
    if (isset($input['image']) && empty(trim($input['image']))) {
        http_response_code(400);
        echo json_encode(['error' => 'Görsel URL boş olamaz']);
        return;
    }
    
    // Güncelleme
    $fields = [];
    $values = [];
    
    foreach (['title', 'summary', 'content', 'category', 'image', 'author', 'date'] as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $values[] = $input[$field];
        }
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'Güncellenecek veri yok']);
        return;
    }
    
    $values[] = $id;
    
    $stmt = $db->prepare("UPDATE news SET " . implode(', ', $fields) . " WHERE id = ?");
    $stmt->execute($values);
    
    http_response_code(200);
    echo json_encode(['message' => 'Haber başarıyla güncellendi']);
}

/**
 * Haber sil
 */
function deleteNews($db, $id) {
    // Haberi kontrol et
    $stmt = $db->prepare("SELECT title FROM news WHERE id = ?");
    $stmt->execute([$id]);
    $news = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$news) {
        http_response_code(404);
        echo json_encode(['error' => 'Haber bulunamadı']);
        return;
    }
    
    // Sil
    $stmt = $db->prepare("DELETE FROM news WHERE id = ?");
    $stmt->execute([$id]);
    
    http_response_code(200);
    echo json_encode(['message' => 'Haber başarıyla silindi', 'title' => $news['title']]);
}

?>
