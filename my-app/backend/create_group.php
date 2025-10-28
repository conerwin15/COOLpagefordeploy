<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db.php';

function respond($arr) {
    echo json_encode($arr);
    exit;
}

// Read fields from FormData ($_POST)
$name        = isset($_POST['name']) ? trim($_POST['name']) : '';
$description = isset($_POST['description']) ? trim($_POST['description']) : null;
$visibility  = (isset($_POST['visibility']) && $_POST['visibility'] === 'private') ? 'private' : 'public';
$created_by  = isset($_POST['created_by']) ? intval($_POST['created_by']) : 0;

// Validation
if ($name === '' || $created_by <= 0 || $visibility === '') {
    respond([
        'success' => false,
        'message' => '⚠️ Missing required fields: name, created_by, or visibility'
    ]);
}

// Handle file upload if provided
$group_photos = null;
if (isset($_FILES['group_photos']) && $_FILES['group_photos']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . "/uploads/groups/";
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $filename = time() . "_" . basename($_FILES['group_photos']['name']);
    $targetPath = $uploadDir . $filename;

    if (move_uploaded_file($_FILES['group_photos']['tmp_name'], $targetPath)) {
        $group_photos = "uploads/groups/" . $filename;
    } else {
        respond([
            'success' => false,
            'message' => '❌ Failed to upload group photo.'
        ]);
    }
}

// Insert group into database
$sql = "INSERT INTO groups (name, description, visibility, created_by, group_photos, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssis", $name, $description, $visibility, $created_by, $group_photos);

if ($stmt->execute()) {
    $group_id = $stmt->insert_id;

    // ✅ Automatically add creator as member with role=admin and status=accepted
    $status = 'accepted';
    $role = 'admin';
    $invited_by = $created_by;

    $memberSql = "INSERT INTO group_members (group_id, user_id, invited_by, status, role, invited_at)
                  VALUES (?, ?, ?, ?, ?, NOW())";

    $memberStmt = $conn->prepare($memberSql);
    $memberStmt->bind_param("iiiss", $group_id, $created_by, $invited_by, $status, $role);
    $memberStmt->execute();
    $memberStmt->close();

    respond([
        'success' => true,
        'message' => '✅ Group created successfully! Creator automatically added as admin.',
        'group_id' => $group_id,
        'group_photo' => $group_photos
    ]);
} else {
    respond([
        'success' => false,
        'message' => '❌ Database error: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
