<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Use absolute path so it always works
require_once __DIR__ . '/../db.php';

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data["id"] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "Missing user ID"]);
    exit;
}

$sql = "DELETE FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$ok = $stmt->execute();

echo json_encode([
    "success" => $ok,
    "message" => $ok ? "User deleted successfully" : "Failed to delete user"
]);

$stmt->close();
$conn->close();
?>
