<?php
// CORS HEADERS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header("Cross-Origin-Opener-Policy: same-origin-allow-popups");

// Include database
include "db.php";

// Include PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';
// Get POST data
$google_id = $_POST['google_id'] ?? '';
$email     = $_POST['email'] ?? '';
$name      = $_POST['name'] ?? '';
$avatar    = $_POST['avatar'] ?? '';
$country   = $_POST['country'] ?? ''; 

// Validate
if (!$google_id || !$email) {
    echo json_encode(["success" => false, "message" => "Missing Google data"]);
    exit;
}

// Split name
$first_name = '';
$last_name  = '';
if (!empty($name)) {
    $parts = explode(' ', $name, 2);
    $first_name = $parts[0];
    $last_name  = $parts[1] ?? '';
}

// Check if user exists
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user) {
    // Update missing country only
    if (empty($user['country']) && !empty($country)) {
        $update = $conn->prepare("UPDATE users SET country = ? WHERE id = ?");
        $update->bind_param("si", $country, $user['id']);
        $update->execute();
        $user['country'] = $country;
    }

    echo json_encode(["success" => true, "user" => $user]);
    exit;
}

// 🔹 NEW USER — Create account
$random_password = bin2hex(random_bytes(8)); // 16 chars
$hashed_password = password_hash($random_password, PASSWORD_DEFAULT);

$username    = strtolower(explode("@", $email)[0]);
$profile_pic = $avatar;
$typeofuser  = "user";
$created_at  = date("Y-m-d H:i:s");

$stmt = $conn->prepare(
    "INSERT INTO users (username, first_name, last_name, email, password, profile_pic, created_at, country, typeofuser)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

$stmt->bind_param(
    "sssssssss",
    $username,
    $first_name,
    $last_name,
    $email,
    $hashed_password,
    $profile_pic,
    $created_at,
    $country,
    $typeofuser
);

if ($stmt->execute()) {
    $newUserId = $stmt->insert_id;

    $newUser = [
        "id"          => $newUserId,
        "username"    => $username,
        "first_name"  => $first_name,
        "last_name"   => $last_name,
        "email"       => $email,
        "profile_pic" => $profile_pic,
        "created_at"  => $created_at,
        "country"     => $country,
        "typeofuser"  => $typeofuser,
        "temp_password" => $random_password
    ];

    // ============================================================
    // ✅ PHPMailer — Send Email Notification for New User
    // ============================================================

    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; // Your SMTP host
        $mail->SMTPAuth   = true;
     $mail->Username = 'erwin@techtreeglobal.com'; // your Gmail address
    $mail->Password = 'wnqe lrrb eilh ckgy';      // Google App Password
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;


        $mail->setFrom('erwin@techtreeglobal.com', 'COOL page');
        $mail->addAddress('erwin@techtreeglobal.com'); // Where you want to receive notifications

        $mail->isHTML(false);
        $mail->Subject = '🔥 New User Registered via Google Login';
        $mail->Body    = "A new user has registered on your system:\n\n" .
                         "Name: $first_name $last_name\n" .
                         "Email: $email\n" .
                         "Country: $country\n" .
                         "Registered At: $created_at\n\n" .
                         "This user registered using Google Login.";

        $mail->send();
        // echo 'Email sent';
    } catch (Exception $e) {
        error_log("Email could not be sent. PHPMailer Error: {$mail->ErrorInfo}");
    }

    echo json_encode(["success" => true, "user" => $newUser]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to create user"]);
}
