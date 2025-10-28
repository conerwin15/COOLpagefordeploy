<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    if (isset($_FILES['banner'])) {
        $file = $_FILES['banner'];
        $targetDir = "uploads/banners/";
        if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);

        $fileName = time() . "_" . basename($file["name"]);
        $targetPath = $targetDir . $fileName;

        if (move_uploaded_file($file["tmp_name"], $targetPath)) {
            // Save to DB
            $stmt = $conn->prepare("INSERT INTO banners (image, created_at) VALUES (?, NOW())");
            $stmt->bind_param("s", $fileName);
            $stmt->execute();

            echo json_encode(["success" => true, "image" => $fileName]);
        } else {
            echo json_encode(["success" => false, "error" => "Upload failed"]);
        }
    } else {
        echo json_encode(["success" => false, "error" => "No banner file uploaded"]);
    }
}

if ($method === 'GET') {
    $result = $conn->query("SELECT * FROM banners ORDER BY id DESC");
    $banners = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($banners);
}
?>