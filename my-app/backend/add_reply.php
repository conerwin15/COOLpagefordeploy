<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require 'db.php';

// Capture input
$postId = $_POST['post_id'] ?? '';
$userId = $_POST['user_id'] ?? '';
$text = $_POST['text'] ?? '';
$parentReplyId = $_POST['parent_reply_id'] ?? null; // ✅ new field for nested replies
date_default_timezone_set('Asia/Singapore');
$createdAt = date('Y-m-d H:i:s');

if (empty($postId) || empty($userId)) {
    echo json_encode(['success' => false, 'message' => 'Missing post ID or user ID']);
    exit;
}

// Validate post
$checkPost = $conn->prepare("SELECT id, user_id FROM posts WHERE id = ?");
$checkPost->bind_param("i", $postId);
$checkPost->execute();
$result = $checkPost->get_result();
if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid post ID']);
    exit;
}
$postData = $result->fetch_assoc();
$postOwnerId = $postData['user_id']; 
$checkPost->close();

// Get user info
$name = 'Unknown';
$profilePic = 'default-avatar.png';
$getUser = $conn->prepare("SELECT username, profile_pic FROM users WHERE id = ?");
$getUser->bind_param("i", $userId);
$getUser->execute();
$userResult = $getUser->get_result();
if ($row = $userResult->fetch_assoc()) {
    $name = $row['username'];
    $profilePic = $row['profile_pic'] ?? 'default-avatar.png';
}
$getUser->close();

// ✅ Insert reply (with optional parent_reply_id)
$stmt = $conn->prepare("
    INSERT INTO replies (post_id, user_id, username, text, created_at, parent_reply_id)
    VALUES (?, ?, ?, ?, ?, ?)
");
$stmt->bind_param("iisssi", $postId, $userId, $name, $text, $createdAt, $parentReplyId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    $replyId = $stmt->insert_id;
    $mediaList = [];

    $uploadDir = "uploads/";
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (!empty($_FILES['media']['name'][0])) {
        foreach ($_FILES['media']['name'] as $index => $fileName) {
            $tmpName = $_FILES['media']['tmp_name'][$index];
            $uniqueName = uniqid() . "_" . basename($fileName);
            $targetFile = $uploadDir . $uniqueName;

            $allowedTypes = [
                'image/jpeg','image/png','image/gif','image/webp','image/bmp','image/svg+xml','image/tiff',
                'video/mp4','video/webm','video/ogg','video/ogv','video/mpeg','video/quicktime',
                'video/x-msvideo','video/x-matroska',
                'audio/mpeg','audio/wav','audio/ogg','audio/webm','audio/aac','audio/mp4','audio/x-m4a'
            ];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $fileType = finfo_file($finfo, $tmpName);
            finfo_close($finfo);

            if (in_array($fileType, $allowedTypes)) {
                if (move_uploaded_file($tmpName, $targetFile)) {
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
    }

    // ✅ Notification — if not replying to self
    if ($postOwnerId && $postOwnerId != $userId) {
        $notifMessage = $parentReplyId 
            ? "$name replied to your comment."
            : "$name replied to your post.";
        $notifLink = "http://localhost:3000/home/post/$postId";

        $notifStmt = $conn->prepare("
            INSERT INTO notifications (user_id, sender_id, message, link, is_read, created_at)
            VALUES (?, ?, ?, ?, 0, NOW())
        ");
        $notifStmt->bind_param("iiss", $postOwnerId, $userId, $notifMessage, $notifLink);
        $notifStmt->execute();
        $notifStmt->close();
    }

    $reply = [
        'id' => $replyId,
        'user_id' => $userId,
        'username' => $name,
        'text' => $text,
        'created_at' => $createdAt,
        'parent_reply_id' => $parentReplyId,
        'media' => $mediaList,
        'profile_picture' => "http://localhost/coolpage/my-app/backend/" . $profilePic
    ];

    echo json_encode(['success' => true, 'reply' => $reply]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to insert reply']);
}

$stmt->close();
$conn->close();
?>
