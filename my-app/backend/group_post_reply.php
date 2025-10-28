<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'db.php';

// Timezone setup
date_default_timezone_set('Asia/Manila');
$created_at = date('Y-m-d H:i:s');

$contentType = $_SERVER["CONTENT_TYPE"] ?? '';
$isMultipart = strpos($contentType, "multipart/form-data") !== false;

if ($isMultipart) {
    $post_id = intval($_POST['post_id'] ?? 0);
    $group_id = intval($_POST['group_id'] ?? 0);
    $user_id = intval($_POST['user_id'] ?? 0);
    $content = trim($_POST['content'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $country = trim($_POST['country'] ?? '');

    // NEW: parent reply ID (for nested reply)
    $parent_id = isset($_POST['parent_id']) && $_POST['parent_id'] !== '' ? intval($_POST['parent_id']) : null;

    if (!$post_id || !$group_id || !$user_id || !$content) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
        exit;
    }

    // Insert new reply — parent_id may be NULL (for main replies) or integer (for reply-to-reply)
    $stmt = $conn->prepare("INSERT INTO group_post_replies 
        (post_id, group_id, user_id, content, username, country, parent_id, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'DB prepare failed', 'error' => $conn->error]);
        exit;
    }

    $stmt->bind_param("iiisssis", $post_id, $group_id, $user_id, $content, $username, $country, $parent_id, $created_at);

    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Failed to insert reply.', 'error' => $stmt->error]);
        exit;
    }

    $reply_id = $stmt->insert_id;
    $stmt->close();

    // Handle uploaded media
    $mediaResults = [];
    if (!empty($_FILES['media']['name'][0])) {
        $uploadDir = "uploads/";
        foreach ($_FILES['media']['tmp_name'] as $index => $tmpName) {
            $fileName = time() . '_' . basename($_FILES['media']['name'][$index]);
            $filePath = $uploadDir . $fileName;

            if (move_uploaded_file($tmpName, $filePath)) {
                $mediaType = $_FILES['media']['type'][$index];
                $stmtMedia = $conn->prepare("INSERT INTO group_reply_media 
                    (reply_id, group_id, media_url, media_type) VALUES (?, ?, ?, ?)");
                $stmtMedia->bind_param("iiss", $reply_id, $group_id, $filePath, $mediaType);
                $stmtMedia->execute();
                $stmtMedia->close();
                $mediaResults[] = ['media_url' => $filePath, 'status' => 'uploaded'];
            } else {
                $mediaResults[] = ['media_url' => $fileName, 'status' => 'failed'];
            }
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Reply created successfully.',
        'reply_id' => $reply_id,
        'parent_id' => $parent_id,
        'created_at' => $created_at,
        'media' => $mediaResults
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid content type']);
}
?>
