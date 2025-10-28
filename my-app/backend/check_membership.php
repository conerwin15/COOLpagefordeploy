<?php
header("Content-Type: application/json");
include 'db.php';

$group_id = $_GET['group_id'] ?? null;
$user_id = $_GET['user_id'] ?? null;

if (!$group_id || !$user_id) {
    echo json_encode(['success' => false, 'message' => 'Missing group_id or user_id']);
    exit;
}

// Check if the user has a membership record
$sql = "SELECT status FROM group_members WHERE group_id=? AND user_id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $group_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(['success' => true, 'status' => $row['status']]);
} else {
    echo json_encode(['success' => true, 'status' => null]); // no record
}
