<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");
require '../db.php';

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data["id"] ?? null;
$user_type = $data["typeofuser"] ?? null;

if (!$user_id || !$user_type) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}

$sql = "UPDATE users SET typeofuser = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $user_type, $user_id);
$ok = $stmt->execute();

echo json_encode(["success" => $ok, "message" => $ok ? "User type updated" : "Update failed"]);
$stmt->close();
$conn->close();
?>
