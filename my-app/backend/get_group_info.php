<?php
// get_group_info.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'db.php'; // make sure this connects to your DB

// ✅ Get group_id from GET query
$group_id = isset($_GET['group_id']) ? intval($_GET['group_id']) : 0;

if ($group_id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid group_id'
    ]);
    exit;
}

try {
    // 🔹 Fetch group info
    $stmt = $conn->prepare("SELECT `id`, `name`, `description`, `created_by`, `created_at`, `visibility`, `group_photos` FROM `groups` WHERE `id` = ?");
    $stmt->bind_param("i", $group_id);
    $stmt->execute();
    $groupResult = $stmt->get_result();
    
    if ($groupResult->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Group not found'
        ]);
        exit;
    }

    $group = $groupResult->fetch_assoc();

    // 🔹 Fetch group members
    $stmt2 = $conn->prepare("SELECT `id`, `group_id`, `user_id`, `invited_by`, `status`, `invited_at`, `role` FROM `group_members` WHERE `group_id` = ?");
    $stmt2->bind_param("i", $group_id);
    $stmt2->execute();
    $membersResult = $stmt2->get_result();

    $members = [];
    while ($row = $membersResult->fetch_assoc()) {
        $members[] = $row;
    }

    // 🔹 Return JSON
    echo json_encode([
        'success' => true,
        'group' => [
            'id' => $group['id'],
            'name' => $group['name'],
            'description' => $group['description'],
            'created_by' => $group['created_by'],
            'created_at' => $group['created_at'],
            'visibility' => $group['visibility'],
            'photo' => $group['group_photos'],
            'members_count' => count($members),
            'members' => $members
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
