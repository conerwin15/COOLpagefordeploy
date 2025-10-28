<?php
header("Content-Type: application/json");
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$group_id = $data['group_id'] ?? null;
$user_id = $data['user_id'] ?? null;

if (!$group_id || !$user_id) {
    echo json_encode(['success' => false, 'message' => 'Missing group_id or user_id']);
    exit;
}

// Delete the pending join request
$stmt = $conn->prepare("DELETE FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'pending'");
$stmt->bind_param("ii", $group_id, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Request cancelled successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to cancel request']);
}
?>
