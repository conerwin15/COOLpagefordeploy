<?php
include 'db.php'; // your existing DB connection
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Fetch banners
$sql = "SELECT id, image FROM banners ORDER BY id DESC";
$result = $conn->query($sql);

$banners = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $banners[] = $row;
    }
}

echo json_encode(['banners' => $banners]);

$conn->close();
