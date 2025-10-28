<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

require 'db.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$ip_address = $_SERVER['REMOTE_ADDR']; // fallback for guests

// Initialize arrays
$totalLikes = [
    'posts' => [],
    'replies' => [],
    'child_replies' => []
];
$userLiked = [];

// --- Fetch like counts grouped by target_type and target_id ---
$result = $conn->query("
    SELECT target_id, target_type, COUNT(*) AS total
    FROM likes
    GROUP BY target_type, target_id
");

while ($row = $result->fetch_assoc()) {
    $type = $row['target_type'];
    $id = $row['target_id'];
    if (isset($totalLikes[$type])) {
        $totalLikes[$type][$id] = (int)$row['total'];
    }
}
$result->close();

// --- Determine which items the current user or guest has liked ---
if ($user_id) {
    $stmt = $conn->prepare("SELECT target_id, target_type FROM likes WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
} else {
    $stmt = $conn->prepare("SELECT target_id, target_type FROM likes WHERE ip_address = ?");
    $stmt->bind_param("s", $ip_address);
}

$stmt->execute();
$res = $stmt->get_result();
while ($row = $res->fetch_assoc()) {
    $key = $row['target_type'] . '_' . $row['target_id'];
    $userLiked[$key] = true;
}
$stmt->close();

echo json_encode([
    'success' => true,
    'total_likes' => $totalLikes,
    'user_liked' => $userLiked
]);

$conn->close();
?>
