<?php
// update_group_info.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require 'db.php';

// 🧩 Support both JSON (name/description) and multipart/form-data (photo upload)
if (isset($_SERVER["CONTENT_TYPE"]) && strpos($_SERVER["CONTENT_TYPE"], "multipart/form-data") !== false) {
    // Handle form-data (for photo + text)
    $group_id = isset($_POST['group_id']) ? intval($_POST['group_id']) : 0;
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
} else {
    // Handle JSON (for name + description only)
    $data = json_decode(file_get_contents("php://input"), true);
    $group_id = isset($data['group_id']) ? intval($data['group_id']) : 0;
    $name = trim($data['name'] ?? '');
    $description = trim($data['description'] ?? '');
}

if ($group_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid group_id']);
    exit;
}

$newPhotoPath = null;

// 📸 If a new photo is uploaded
if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = "uploads/group_photos/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
    $newFileName = "group_" . $group_id . "_" . time() . "." . $ext;
    $uploadPath = $uploadDir . $newFileName;

    if (move_uploaded_file($_FILES['photo']['tmp_name'], $uploadPath)) {
        $newPhotoPath = $uploadPath;
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to upload photo']);
        exit;
    }
}

try {
    // 🛠️ Build dynamic query
    if ($newPhotoPath) {
        $stmt = $conn->prepare("UPDATE `groups` SET `name` = ?, `description` = ?, `group_photos` = ? WHERE `id` = ?");
        $stmt->bind_param("sssi", $name, $description, $newPhotoPath, $group_id);
    } else {
        $stmt = $conn->prepare("UPDATE `groups` SET `name` = ?, `description` = ? WHERE `id` = ?");
        $stmt->bind_param("ssi", $name, $description, $group_id);
    }

    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Group info updated successfully',
        'new_photo' => $newPhotoPath ? $newPhotoPath : null
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
