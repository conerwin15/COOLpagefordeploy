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

$data = json_decode(file_get_contents("php://input"), true);
$group_id = isset($data['group_id']) ? intval($data['group_id']) : 0;
$user_id  = isset($data['user_id']) ? intval($data['user_id']) : 0;

if (!$group_id || !$user_id) {
    echo json_encode(["success" => false, "message" => "❌ Missing group_id or user_id"]);
    exit();
}

// Check if the user is the creator/admin of the group
$stmt = $conn->prepare("SELECT created_by FROM groups WHERE id = ?");
$stmt->bind_param("i", $group_id);
$stmt->execute();
$result = $stmt->get_result();
$group = $result->fetch_assoc();
$stmt->close();

if (!$group) {
    echo json_encode(["success" => false, "message" => "❌ Group not found"]);
    exit();
}

// Prevent admin from leaving the group
if ($group['created_by'] == $user_id) {
    echo json_encode(["success" => false, "message" => "⚠️ Group creator cannot leave the group"]);
    exit();
}

// Remove member from group
$stmt = $conn->prepare("DELETE FROM group_members WHERE group_id = ? AND user_id = ?");
$stmt->bind_param("ii", $group_id, $user_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "✅ You have left the group."]);
} else {
    echo json_encode(["success" => false, "message" => "❌ Failed to leave group."]);
}

$stmt->close();
$conn->close();
?>
