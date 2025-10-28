<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db.php';

// Helper function
function respond($arr) {
    echo json_encode($arr);
    exit;
}

$user_id = $_POST['user_id'] ?? null;
$message = $_POST['message'] ?? '';
$link    = $_POST['link'] ?? '';

if (!$user_id || !$message) {
    respond(['success' => false, 'message' => 'Missing user_id or message']);
}

// ✅ Fetch username and profile pic from users table
$userQuery = $conn->prepare("SELECT username, profile_pic FROM users WHERE id = ?");
$userQuery->bind_param("i", $user_id);
$userQuery->execute();
$userResult = $userQuery->get_result();

if ($userResult->num_rows === 0) {
    respond(['success' => false, 'message' => 'User not found']);
}

$userData = $userResult->fetch_assoc();
$username = $userData['username'];
$profile_pic = $userData['profile_pic'] ?: 'http://localhost/coolpage/my-app/backend/default-avatar.png';
$userQuery->close();

// ✅ Insert into notifications (including username & profile_pic)
$stmt = $conn->prepare("
    INSERT INTO notifications (user_id, message, link, username, profile_pic, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, 0, NOW())
");
$stmt->bind_param("issss", $user_id, $message, $link, $username, $profile_pic);

if ($stmt->execute()) {
    respond([
        'success' => true,
        'message' => 'Notification saved',
        'data' => [
            'user_id' => $user_id,
            'username' => $username,
            'profile_pic' => $profile_pic,
            'message' => $message,
            'link' => $link
        ]
    ]);
} else {
    respond(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
