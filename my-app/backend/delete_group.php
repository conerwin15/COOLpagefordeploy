<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$group_id = $data["group_id"] ?? null;

if (!$group_id) {
    echo json_encode(["success" => false, "message" => "Missing `group_id`"]);
    exit;
}

$sql = "DELETE FROM `groups` WHERE `id` = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $group_id);
$ok = $stmt->execute();

if ($ok) {
    echo json_encode(["success" => true, "message" => "Group deleted"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete group"]);
}

$stmt->close();
$conn->close();
?>
