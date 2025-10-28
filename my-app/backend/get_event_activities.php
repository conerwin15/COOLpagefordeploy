<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include 'db.php';

$response = ["success" => false, "data" => []];

try {
    $query = "SELECT * FROM cool_event_activities ORDER BY created_at DESC";
    $result = $conn->query($query);

    if ($result->num_rows > 0) {
        $activities = [];
        while ($row = $result->fetch_assoc()) {
            $row['media_url'] = !empty($row['media'])
                ? $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'] . '/api/uploads/events/' . $row['media']
                : null;
            $activities[] = $row;
        }
        $response["success"] = true;
        $response["data"] = $activities;
    } else {
        $response["message"] = "No activities found.";
    }
} catch (Exception $e) {
    $response["message"] = $e->getMessage();
}

echo json_encode($response);
