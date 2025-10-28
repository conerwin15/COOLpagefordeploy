<?php
require 'db.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$group_id = isset($data['group_id']) ? intval($data['group_id']) : 0;
$user_id  = isset($data['user_id']) ? intval($data['user_id']) : 0;

if ($group_id <= 0 || $user_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid group_id or user_id"
    ]);
    exit;
}

// Check if already in group
$sql = "SELECT id, status FROM group_members WHERE group_id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $group_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if ($row['status'] === 'accepted') {
        echo json_encode([
            "success" => false,
            "message" => "You are already a member of this group."
        ]);
        exit;
    } else {
        // Update status back to pending
        $update = $conn->prepare("UPDATE group_members SET status = 'pending' WHERE id = ?");
        $update->bind_param("i", $row['id']);
        $update->execute();
        $update->close();

        echo json_encode([
            "success" => true,
            "message" => "Your join request has been re-submitted and is pending approval."
        ]);
        exit;
    }
} else {
    // Insert new join request
    $insert = $conn->prepare("INSERT INTO group_members (group_id, user_id, status, invited_at) VALUES (?, ?, 'pending', NOW())");
    $insert->bind_param("ii", $group_id, $user_id);
    if ($insert->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Your join request has been sent and is pending approval."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Database error: " . $insert->error
        ]);
    }
    $insert->close();
}

$stmt->close();
$conn->close();
?>
