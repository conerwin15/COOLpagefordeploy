<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$member_id = isset($data['member_id']) ? intval($data['member_id']) : 0;
$action = isset($data['action']) ? $data['action'] : '';
$admin_id = isset($data['admin_id']) ? intval($data['admin_id']) : 0;

if (!$member_id || !$action || !$admin_id) {
    echo json_encode(['success' => false, 'message' => '❌ Missing parameters']);
    exit;
}

// Get group of this member
$stmt = $conn->prepare("SELECT group_id FROM group_members WHERE id=?");
$stmt->bind_param("i", $member_id);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(['success' => false, 'message' => '❌ Request not found']);
    exit;
}
$group_id = $row['group_id'];

// Verify if admin is group creator
$stmt = $conn->prepare("SELECT created_by FROM `groups` WHERE id=?");
$stmt->bind_param("i", $group_id);
$stmt->execute();
$res = $stmt->get_result();
$group = $res->fetch_assoc();
$stmt->close();

if ($group['created_by'] != $admin_id) {
    echo json_encode(['success' => false, 'message' => '⚠️ Not authorized']);
    exit;
}

// Approve or reject
if ($action === "approve") {
    $stmt = $conn->prepare("UPDATE group_members SET status='accepted', role='member' WHERE id=?");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $stmt->close();
    echo json_encode(['success' => true, 'message' => '✅ Request approved']);
} elseif ($action === "reject") {
    $stmt = $conn->prepare("DELETE FROM group_members WHERE id=?");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $stmt->close();
    echo json_encode(['success' => true, 'message' => '❌ Request rejected']);
} else {
    echo json_encode(['success' => false, 'message' => '⚠️ Invalid action']);
}

$conn->close();
?>
