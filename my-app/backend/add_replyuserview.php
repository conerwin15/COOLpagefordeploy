<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require 'db.php';
date_default_timezone_set('Asia/Singapore');

$postId = $_POST['post_id'] ?? '';
$userId = $_POST['user_id'] ?? '';
$text = $_POST['text'] ?? '';
$createdAt = date('Y-m-d H:i:s');

if (empty($postId) || empty($userId)) {
    echo json_encode(['success' => false, 'message' => 'Missing post ID or user ID']);
    exit;
}

// Validate post
$postCheck = $conn->prepare("SELECT id, user_id FROM posts WHERE id = ?");
$postCheck->bind_param("i", $postId);
$postCheck->execute();
$postRes = $postCheck->get_result();
if ($postRes->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid post ID']);
    exit;
}
$postData = $postRes->fetch_assoc();
$postOwnerId = $postData['user_id'];
$postCheck->close();

// Validate user
$userCheck = $conn->prepare("SELECT username, profile_pic FROM users WHERE id = ?");
$userCheck->bind_param("i", $userId);
$userCheck->execute();
$userRes = $userCheck->get_result();
if ($userRes->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
    exit;
}
$userData = $userRes->fetch_assoc();
$name = $userData['username'];
$profilePic = $userData['profile_pic'] ?? 'uploads/default-avatar.png';
$userCheck->close();

// Insert reply
$stmt = $conn->prepare("INSERT INTO replies (post_id, user_id, username, text, created_at) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("iisss", $postId, $userId, $name, $text, $createdAt);

try {
    $stmt->execute();
    $replyId = $stmt->insert_id;
    $stmt->close();

    // Handle media
    $mediaList = [];
    if (!empty($_FILES['media']['name'][0])) {
        $uploadDir = "uploads/";
        if (!file_exists($uploadDir)) mkdir($uploadDir, 0755, true);

        foreach ($_FILES['media']['name'] as $index => $fileName) {
            $tmpName = $_FILES['media']['tmp_name'][$index];
            $uniqueName = uniqid() . "_" . basename($fileName);
            $targetFile = $uploadDir . $uniqueName;

            $allowedTypes = ['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/ogg'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $fileType = finfo_file($finfo, $tmpName);
            finfo_close($finfo);

            if (in_array($fileType, $allowedTypes) && move_uploaded_file($tmpName, $targetFile)) {
                $mediaType = pathinfo($targetFile, PATHINFO_EXTENSION);
                $stmtMedia = $conn->prepare("INSERT INTO reply_media (reply_id, media_url, media_type) VALUES (?, ?, ?)");
                $stmtMedia->bind_param("iss", $replyId, $targetFile, $mediaType);
                $stmtMedia->execute();
                $stmtMedia->close();

                $mediaList[] = [
                    'url' => "http://localhost/coolpage/my-app/backend/" . $targetFile,
                    'type' => $mediaType
                ];
            }
        }
    }

    // Notify post owner if different user
    if ($postOwnerId != $userId) {
        $notifMsg = "$name replied to your post.";
        $notifLink = "http://localhost:3000/home/post/$postId";
        $notifStmt = $conn->prepare("INSERT INTO notifications (user_id, sender_id, message, link, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())");
        $notifStmt->bind_param("iiss", $postOwnerId, $userId, $notifMsg, $notifLink);
        $notifStmt->execute();
        $notifStmt->close();
    }

    $reply = [
        'id' => $replyId,
        'user_id' => $userId,
        'username' => $name,
        'text' => $text,
        'created_at' => $createdAt,
        'profile_picture' => "http://localhost/coolpage/my-app/backend/" . $profilePic,
        'media' => $mediaList
    ];

    echo json_encode(['success' => true, 'reply' => $reply]);

} catch (mysqli_sql_exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
