<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

include 'db.php'; // Make sure this file sets up $conn

$response = ["success" => false, "message" => ""];

try {
    $uploadDir = __DIR__ . "/uploads/events/";
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $event_name = $_POST['event_name'] ?? '';
    $description = $_POST['description'] ?? '';
    $event_date = $_POST['event_date'] ?? '';
    $location = $_POST['location'] ?? '';
    $country = $_POST['country'] ?? '';
    $organizer = $_POST['organizer'] ?? '';
    $link = $_POST['link'] ?? '';
    $created_by = $_POST['created_by'] ?? 0;

    if (empty($event_name) || empty($description) || empty($event_date) || empty($location) || empty($country) || empty($organizer)) {
        throw new Exception("Please fill in all required fields.");
    }

    // Handle media upload
    $mediaName = null;
    $mediaType = null;
    if (isset($_FILES['media']) && $_FILES['media']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['media']['tmp_name'];
        $fileName = time() . "_" . basename($_FILES['media']['name']);
        $filePath = $uploadDir . $fileName;

        $mimeType = mime_content_type($fileTmpPath);
        if (str_starts_with($mimeType, "image")) {
            $mediaType = "image";
        } elseif (str_starts_with($mimeType, "video")) {
            $mediaType = "video";
        } else {
            throw new Exception("Unsupported media type.");
        }

        if (!move_uploaded_file($fileTmpPath, $filePath)) {
            throw new Exception("Failed to upload media.");
        }
        $mediaName = $fileName;
    }

    $stmt = $conn->prepare("INSERT INTO cool_event_activities (event_name, description, event_date, location, country, organizer, link, media, media_type, created_by)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssssi", $event_name, $description, $event_date, $location, $country, $organizer, $link, $mediaName, $mediaType, $created_by);

    if ($stmt->execute()) {
        $response["success"] = true;
        $response["message"] = "Event added successfully!";
    } else {
        throw new Exception("Database error: " . $stmt->error);
    }

} catch (Exception $e) {
    $response["message"] = $e->getMessage();
}

echo json_encode($response);
