<?php
// Allow CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Include PHPMailer
require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

// Database connection
require 'db.php';  // <-- fixed missing semicolon

// Read JSON data
$data = json_decode(file_get_contents("php://input"), true);
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$contact = $data['contact'] ?? '';
$message = $data['message'] ?? '';

if (!$name || !$email || !$contact || !$message) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// ✅ Insert into database
$stmt = $conn->prepare("INSERT INTO contact_messages (name, email, contact, message, created_at) VALUES (?, ?, ?, ?, NOW())");
$stmt->bind_param("ssss", $name, $email, $contact, $message);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "DB insert error: " . $stmt->error]);
    exit;
}

// ✅ Send email
$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'erwin@techtreeglobal.com'; // your Gmail address
    $mail->Password = 'wnqe lrrb eilh ckgy';      // Google App Password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Recipients
    $mail->setFrom($email, $name); // visitor
    $mail->addAddress('erwin@techtreeglobal.com', 'Erwin'); // you
    $mail->addReplyTo($email, $name);

    // Email content
    $mail->isHTML(true);
    $mail->Subject = 'New contact form COOL PAGE';
    $mail->Body    = "
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> {$name}</p>
        <p><strong>Email:</strong> {$email}</p>
        <p><strong>Contact Number:</strong> {$contact}</p>
        <p><strong>Message:</strong><br>{$message}</p>
    ";

    $mail->send();
    echo json_encode(["success" => true, "message" => "Message submitted successfully!"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Email error: {$mail->ErrorInfo}"]);
}

$stmt->close();
$conn->close();
?>
