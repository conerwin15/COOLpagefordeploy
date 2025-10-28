<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db.php';

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);
$group_id = isset($data['group_id']) ? intval($data['group_id']) : 0;
$user_id  = isset($data['user_id']) ? intval($data['user_id']) : 0;
$admin_id = isset($data['admin_id']) ? intval($data['admin_id']) : 0;

if (!$group_id || !$user_id || !$admin_id) {
    echo json_encode(['success' => false, 'message' => '⚠️ Missing parameters']);
    exit;
}

// Verify admin (creator of group)
$stmt = $conn->prepare("SELECT created_by FROM groups WHERE id=?");
$stmt->bind_param("i", $group_id);
$stmt->execute();
$result = $stmt->get_result();
$group = $result->fetch_assoc();
$stmt->close();

if (!$group) {
    echo json_encode(['success' => false, 'message' => '❌ Group not found']);
    exit;
}

if ($group['created_by'] != $admin_id) {
    echo json_encode(['success' => false, 'message' => '❌ You are not the admin of this group']);
    exit;
}

// Prevent admin from removing themselves
if ($user_id === $admin_id) {
    echo json_encode(['success' => false, 'message' => '⚠️ Admin cannot remove themselves']);
    exit;
}

// Remove member
$stmt = $conn->prepare("DELETE FROM group_members WHERE group_id=? AND user_id=?");
$stmt->bind_param("ii", $group_id, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => '✅ Member removed successfully']);
} else {
    echo json_encode(['success' => false, 'message' => '❌ Failed to remove member']);
}

$stmt->close();
$conn->close();
?>
