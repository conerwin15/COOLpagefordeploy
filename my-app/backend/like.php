<?php
// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    exit(0);
}

// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require 'db.php';

// Extract POST data
$user_id = $_POST['user_id'] ?? null;        // liker
$target_id = $_POST['target_id'] ?? null;    // post or reply id
$target_type = $_POST['target_type'] ?? null; // 'post' or 'reply'
$created_at = date('Y-m-d H:i:s');
$ip_address = $_SERVER['REMOTE_ADDR'] ?? '';

// Validate input
if (!$user_id || !$target_id || !$target_type) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

// Prevent duplicate likes
$check = $conn->prepare("SELECT id FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?");
$check->bind_param("iis", $user_id, $target_id, $target_type);
$check->execute();
$result = $check->get_result();
if ($result->num_rows > 0) {
    // Still return like count even if already liked
    $countQuery = $conn->prepare("SELECT COUNT(*) AS total_likes FROM likes WHERE target_id = ? AND target_type = ?");
    $countQuery->bind_param("is", $target_id, $target_type);
    $countQuery->execute();
    $countResult = $countQuery->get_result()->fetch_assoc();
    $countQuery->close();

    echo json_encode([
        'success' => false,
        'message' => 'Already liked',
        'like_count' => (int)$countResult['total_likes']
    ]);
    $check->close();
    exit;
}
$check->close();

// Insert like
$insert = $conn->prepare("INSERT INTO likes (user_id, target_id, target_type, ip_address, created_at) VALUES (?, ?, ?, ?, ?)");
$insert->bind_param("iisss", $user_id, $target_id, $target_type, $ip_address, $created_at);
$insert->execute();

if ($insert->affected_rows > 0) {
    // ✅ Get total likes (works for post, reply, or child reply)
    $countQuery = $conn->prepare("SELECT COUNT(*) AS total_likes FROM likes WHERE target_id = ? AND target_type = ?");
    $countQuery->bind_param("is", $target_id, $target_type);
    $countQuery->execute();
    $countResult = $countQuery->get_result()->fetch_assoc();
    $like_count = (int)$countResult['total_likes'];
    $countQuery->close();

    // Get liker info
    $userQuery = $conn->prepare("SELECT username, first_name, last_name FROM users WHERE id = ?");
    $userQuery->bind_param("i", $user_id);
    $userQuery->execute();
    $userData = $userQuery->get_result()->fetch_assoc();
    $liker_name = trim(($userData['first_name'] ?? '') . ' ' . ($userData['last_name'] ?? ''));
    if (empty($liker_name)) $liker_name = $userData['username'] ?? 'Someone';
    $userQuery->close();

    // Get owner of the target (post or reply, including child reply)
    if ($target_type === 'post') {
        $ownerQuery = $conn->prepare("SELECT user_id FROM posts WHERE id = ?");
    } else {
        $ownerQuery = $conn->prepare("SELECT user_id, post_id FROM replies WHERE id = ?");
    }
    $ownerQuery->bind_param("i", $target_id);
    $ownerQuery->execute();
    $ownerData = $ownerQuery->get_result()->fetch_assoc();
    $owner_id = $ownerData['user_id'] ?? null;
    $post_id = $ownerData['post_id'] ?? $target_id;
    $ownerQuery->close();

    // ✅ Notification (skip if self-like)
    if ($owner_id && $owner_id != $user_id) {
        $message = $target_type === 'post'
            ? "$liker_name liked your post."
            : "$liker_name liked your reply.";

        $link = "http://localhost:3000/home/post/$post_id";

        $notifStmt = $conn->prepare("INSERT INTO notifications (user_id, sender_id, message, link, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())");
        $notifStmt->bind_param("iiss", $owner_id, $user_id, $message, $link);
        $notifStmt->execute();
        $notifStmt->close();
    }

    echo json_encode([
        'success' => true,
        'message' => 'Liked successfully',
        'like_count' => $like_count
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to like']);
}

$insert->close();
$conn->close();
?>
