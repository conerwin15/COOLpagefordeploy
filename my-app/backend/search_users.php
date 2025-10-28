<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include 'db.php';

$search = $_GET['q'] ?? '';
$search = "%" . $conn->real_escape_string($search) . "%";

// Include profile_pic in the SELECT
$sql = "SELECT id, username, profile_pic FROM users WHERE username LIKE ? LIMIT 10";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $search);
$stmt->execute();
$result = $stmt->get_result();

$users = [];
while ($row = $result->fetch_assoc()) {
    // Optional: prepend base URL if needed
    $row['profile_pic'] = $row['profile_pic'] 
        ? (preg_match('/^https?:\/\//', $row['profile_pic']) ? $row['profile_pic'] : "uploads/" . $row['profile_pic'])
        : '/default-avatar.png';
    $users[] = $row;
}

echo json_encode(['success' => true, 'users' => $users]);
?>
