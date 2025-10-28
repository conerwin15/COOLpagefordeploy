<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require 'db.php';

/*
   Fetch all groups with owner details.
   Includes creator's `name`, `username`, and `visibility`.
*/

$sql = "SELECT 
            g.`id`,
            g.`name`,
            g.`description`,
            g.`created_by`,
            g.`created_at`,
            g.`visibility`,
            g.`group_photos`,
            u.`username`,
            u.`first_name`,
            u.`last_name`,
            u.`typeofuser`
        FROM `groups` g
        LEFT JOIN `users` u ON g.`created_by` = u.`id`
        ORDER BY g.`created_at` DESC";

$result = $conn->query($sql);

$groups = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {

        // ✅ Build full name or fallback to username
        $owner_name = trim($row["first_name"] . " " . $row["last_name"]);
        if (empty($owner_name)) {
            $owner_name = $row["username"] ?? "Unknown";
        }

        $groups[] = [
            "id" => $row["id"],
            "name" => $row["name"],
            "description" => $row["description"],
            "created_by" => $row["created_by"],
            "created_at" => $row["created_at"],
            "visibility" => $row["visibility"],
            "group_photos" => $row["group_photos"],
            "owner_name" => $owner_name,
            "owner_username" => $row["username"],
            "owner_type" => $row["typeofuser"] // 👈 helps detect admins in frontend
        ];
    }

    echo json_encode([
        "success" => true,
        "groups" => $groups
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "No groups found."
    ]);
}

$conn->close();
?>
