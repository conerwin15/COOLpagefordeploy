<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$group_id = isset($data['group_id']) ? intval($data['group_id']) : 0;
$admin_id = isset($data['admin_id']) ? intval($data['admin_id']) : 0;

if (!$group_id || !$admin_id) {
    echo json_encode(['success' => false, 'message' => '❌ Missing parameters']);
    exit;
}

// Verify if admin (creator of the group)
$stmt = $conn->prepare("SELECT created_by FROM groups WHERE id=?");
$stmt->bind_param("i", $group_id);
$stmt->execute();
$res = $stmt->get_result();
$group = $res->fetch_assoc();
$stmt->close();

if (!$group) {
    echo json_encode(['success' => false, 'message' => '❌ Group not found']);
    exit;
}

if ($group['created_by'] != $admin_id) {
    echo json_encode(['success' => false, 'message' => '⚠️ Not authorized']);
    exit;
}

// Fetch pending members
$stmt = $conn->prepare("
    SELECT gm.id AS member_id, gm.user_id, gm.invited_at, gm.role, u.username, u.email
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ? AND gm.status = 'pending'
");
$stmt->bind_param("i", $group_id);
$stmt->execute();
$result = $stmt->get_result();

$pending = [];
while ($row = $result->fetch_assoc()) {
    $pending[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'pending_requests' => $pending]);
?>
