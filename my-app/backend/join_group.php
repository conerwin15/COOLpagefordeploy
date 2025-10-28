<?php
header("Content-Type: application/json");
include 'db.php'; // your database connection

$data = json_decode(file_get_contents("php://input"), true);

$group_id = $data['group_id'] ?? null;
$user_id = $data['user_id'] ?? null;

if (!$group_id || !$user_id) {
    echo json_encode(['success' => false, 'message' => 'Missing group_id or user_id']);
    exit;
}

// Check if the user already has a pending/joined record
$check_sql = "SELECT id FROM group_members WHERE group_id=? AND user_id=?";
$stmt = $conn->prepare($check_sql);
$stmt->bind_param("ii", $group_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Request already exists']);
    exit;
}

// Insert pending request
$insert_sql = "INSERT INTO group_members (group_id, user_id, status, invited_at) VALUES (?, ?, 'pending', NOW())";
$stmt = $conn->prepare($insert_sql);
$stmt->bind_param("ii", $group_id, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Request sent']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
