<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include 'db.php';

$response = ["success" => false, "data" => []];

try {
    // ✅ Use event_date if available, otherwise fall back to created_at
    $query = "SELECT * FROM cool_event_activities 
              ORDER BY 
                CASE 
                    WHEN event_date IS NOT NULL THEN event_date 
                    ELSE created_at 
                END DESC";

    $result = $conn->query($query);

    if ($result && $result->num_rows > 0) {
        $activities = [];
        while ($row = $result->fetch_assoc()) {
            $row['media_url'] = !empty($row['media'])
                ? ($_SERVER['REQUEST_SCHEME'] ?? 'http') . '://' . $_SERVER['HTTP_HOST'] . '/api/uploads/events/' . $row['media']
                : null;
            $activities[] = $row;
        }
        $response["success"] = true;
        $response["data"] = $activities;
    } else {
        $response["message"] = "No activities found.";
    }
} catch (Exception $e) {
    $response["message"] = "Error: " . $e->getMessage();
}

echo json_encode($response);
