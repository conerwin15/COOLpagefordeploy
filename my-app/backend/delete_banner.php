<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require 'db.php'; // ✅ should define $conn (MySQLi connection)

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Decode JSON input
$data = json_decode(file_get_contents("php://input"), true);
$banner_id = $data["id"] ?? null;

if (!$banner_id) {
    echo json_encode(["success" => false, "message" => "Missing `id`"]);
    exit;
}

// ✅ Prepare and execute deletion
$sql = "DELETE FROM `banners` WHERE `id` = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $banner_id);
$ok = $stmt->execute();

if ($ok) {
    echo json_encode(["success" => true, "message" => "Banner deleted successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete banner."]);
}

$stmt->close();
$conn->close();
?>
