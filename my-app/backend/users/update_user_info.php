<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");
require '../db.php';

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;
$first = $data['first_name'] ?? '';
$last = $data['last_name'] ?? '';
$password = $data['password'] ?? '';

if (!$id || !$first || !$last) {
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
}

if ($password) {
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $sql = "UPDATE users SET first_name=?, last_name=?, password=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", $first, $last, $hashed, $id);
} else {
    $sql = "UPDATE users SET first_name=?, last_name=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssi", $first, $last, $id);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Update failed"]);
}

$stmt->close();
$conn->close();
?>
