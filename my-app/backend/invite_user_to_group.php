<?php
// Show errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require 'db.php';

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

$group_id   = $data['group_id']   ?? null;
$user_id    = $data['user_id']    ?? null; // invited user
$invited_by = $data['invited_by'] ?? null;
$invited_at = date('Y-m-d H:i:s');

if (!$group_id || !$user_id || !$invited_by) {
    echo json_encode(['success' => false, 'message' => '❌ Missing parameters']);
    exit;
}

// Check if already in group or invited
$check = $conn->prepare("SELECT id, status FROM group_members WHERE group_id = ? AND user_id = ?");
$check->bind_param("ii", $group_id, $user_id);
$check->execute();
$result = $check->get_result();

if ($row = $result->fetch_assoc()) {
    if ($row['status'] === 'pending') {
        echo json_encode(['success' => false, 'message' => '⚠️ User already invited.']);
    } elseif ($row['status'] === 'accepted') {
        echo json_encode(['success' => false, 'message' => '✅ User already a member.']);
    } else {
        echo json_encode(['success' => false, 'message' => '⚠️ Invite record already exists.']);
    }
    $check->close();
    exit;
}
$check->close();

// Insert new invite
$stmt = $conn->prepare("
    INSERT INTO group_members (group_id, user_id, invited_by, status, invited_at)
    VALUES (?, ?, ?, 'pending', ?)
");
$stmt->bind_param("iiis", $group_id, $user_id, $invited_by, $invited_at);

if ($stmt->execute()) {
    // ✅ Send notification to invited user
    $inviterQuery = $conn->prepare("SELECT first_name, last_name, username FROM users WHERE id = ?");
    $inviterQuery->bind_param("i", $invited_by);
    $inviterQuery->execute();
    $inviterData = $inviterQuery->get_result()->fetch_assoc();
    $inviter_name = trim(($inviterData['first_name'] ?? '') . ' ' . ($inviterData['last_name'] ?? ''));
    if (empty($inviter_name)) $inviter_name = $inviterData['username'] ?? 'Someone';
    $inviterQuery->close();

    // Get group name for notification message
    $groupQuery = $conn->prepare("SELECT name FROM groups WHERE id = ?");
    $groupQuery->bind_param("i", $group_id);
    $groupQuery->execute();
    $groupData = $groupQuery->get_result()->fetch_assoc();
    $group_name = $groupData['name'] ?? 'a group';
    $groupQuery->close();

    $message = "$inviter_name invited you to join \"$group_name\".";
    $link = "http://localhost:3000/groups/$group_id";

    $notifStmt = $conn->prepare("INSERT INTO notifications (user_id, sender_id, message, link, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())");
    $notifStmt->bind_param("iiss", $user_id, $invited_by, $message, $link);
    $notifStmt->execute();
    $notifStmt->close();

    echo json_encode(['success' => true, 'message' => '✅ User invited successfully and notification sent.']);
} else {
    echo json_encode(['success' => false, 'message' => '❌ Failed to invite user.']);
}

$stmt->close();
$conn->close();
?>
