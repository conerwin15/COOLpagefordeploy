<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

// ✅ Corrected path
require '../db.php';

$sql = "SELECT id, username, first_name, last_name, email, profile_pic, created_at, country, typeofuser FROM users";
$result = $conn->query($sql);

$users = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}

echo json_encode(["success" => true, "users" => $users]);
$conn->close();
?>
