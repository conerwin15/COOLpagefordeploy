<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require 'db.php';

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);
$notifId = $data['id'] ?? null;

if (!$notifId) {
    echo json_encode([
        'success' => false,
        'message' => 'Notification ID is required'
    ]);
    exit;
}

// Update notification as read
$stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?");
$stmt->bind_param("i", $notifId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode([
        'success' => true,
        'message' => 'Notification marked as read'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update notification or already read'
    ]);
}

$stmt->close();
$conn->close();
?>
