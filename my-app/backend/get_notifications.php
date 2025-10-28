<?php
// --- Allow requests from your React frontend ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// --- Handle preflight request ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';

// --- Get user_id from query string ---
$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing user_id'
    ]);
    exit;
}

// --- Fetch notifications joined with sender info ---
$query = $conn->prepare("
    SELECT n.id, n.message, n.link, n.is_read, n.created_at,
           u.username, u.profile_pic
    FROM notifications n
    LEFT JOIN users u ON n.sender_id = u.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
");
$query->bind_param("i", $user_id);
$query->execute();
$result = $query->get_result();

$notifications = [];
while ($row = $result->fetch_assoc()) {
    $profilePic = $row['profile_pic'];

    // ✅ Detect if it's a Google/external image
    if ($profilePic && (str_starts_with($profilePic, 'http://') || str_starts_with($profilePic, 'https://'))) {
        // Use as-is (Google or external)
        $finalPic = $profilePic;
    } elseif ($profilePic) {
        // Local upload
        $finalPic = 'http://localhost/coolpage/my-app/backend/uploads/' . $profilePic;
    } else {
        // Default avatar
        $finalPic = 'http://localhost/coolpage/my-app/backend/default-avatar.png';
    }

    $notifications[] = [
        'id' => $row['id'],
        'message' => $row['message'],
        'link' => $row['link'],
        'is_read' => $row['is_read'],
        'created_at' => $row['created_at'],
        'username' => $row['username'] ?? 'Unknown',
        'profile_pic' => $finalPic
    ];
}

// --- Send response ---
echo json_encode([
    'success' => true,
    'notifications' => $notifications
]);

$query->close();
$conn->close();
?>
