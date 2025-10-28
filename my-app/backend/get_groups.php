<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
ini_set('display_errors', 1);

require 'db.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$where = isset($_GET['where']) ? $_GET['where'] : '';

$response = [
    'success' => true,
    'my_groups' => [],
    'public_groups' => [],
    'pending_invites' => [],
    'sent_invites' => []
];

// ✅ If user_id is provided, get my_groups, pending_invites, sent_invites
if ($user_id > 0) {
    // My Groups
    $sql = "SELECT DISTINCT g.id, g.name, g.description, g.visibility, g.group_photos
            FROM groups g
            LEFT JOIN group_members gm ON g.id = gm.group_id
            WHERE g.created_by = ? OR (gm.user_id = ? AND gm.status = 'accepted')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $user_id, $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $row['group_photos'] = $row['group_photos'] ?? '';
        $response['my_groups'][] = $row;
    }
    $stmt->close();

    // Pending Invites
    $sql = "SELECT gm.group_id AS id, g.name, g.group_photos, u.username AS invited_by
            FROM group_members gm
            JOIN groups g ON gm.group_id = g.id
            JOIN users u ON gm.invited_by = u.id
            WHERE gm.user_id = ? AND gm.status = 'pending'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $row['group_photos'] = $row['group_photos'] ?? '';
        $response['pending_invites'][] = $row;
    }
    $stmt->close();

    // Sent Invites
    $sql = "SELECT gm.group_id, g.name AS group_name, g.group_photos, u.username AS username, gm.status, gm.user_id
            FROM group_members gm
            JOIN groups g ON gm.group_id = g.id
            JOIN users u ON gm.user_id = u.id
            WHERE gm.invited_by = ? AND gm.status = 'pending'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $row['group_photos'] = $row['group_photos'] ?? '';
        $response['sent_invites'][] = $row;
    }
    $stmt->close();
}

// ✅ Public Groups (all public groups)
if ($where === "public" || $user_id === 0) {
    $sql = "SELECT id, name, description, group_photos FROM groups WHERE visibility = 'public'";
    $res = $conn->query($sql);
    while ($row = $res->fetch_assoc()) {
        $row['group_photos'] = $row['group_photos'] ?? '';
        $response['public_groups'][] = $row;
    }
}

$conn->close();
echo json_encode($response);
?>
