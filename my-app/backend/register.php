<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

require 'db.php';

// PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';


// Enable MySQLi exceptions
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = new mysqli($host, $user, $pass, $db);

    // Upload directory
    $uploadDir = __DIR__ . "/uploads/";
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    // Retrieve POST data
    $username = $_POST['username'] ?? '';
    $first_name = $_POST['first_name'] ?? '';
    $last_name = $_POST['last_name'] ?? '';
    $email = $_POST['email'] ?? '';
    $passwordRaw = $_POST['password'] ?? '';
    $country = $_POST['country'] ?? '';
    $profile_pic = null;
    $typeofuser = 'User';

    // Check for required fields
    if (empty($username) || empty($first_name) || empty($last_name) || empty($email) || empty($passwordRaw) || empty($country)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing required fields"]);
        exit();
    }

    // Hash password
    $hashedPassword = password_hash($passwordRaw, PASSWORD_DEFAULT);

    // Handle file upload if provided
    if (isset($_FILES['profile_pic']) && $_FILES['profile_pic']['error'] === 0) {
        $file = $_FILES['profile_pic'];
        $filename = time() . '_' . basename($file["name"]);
        $targetPath = $uploadDir . $filename;

        if (move_uploaded_file($file["tmp_name"], $targetPath)) {
            $profile_pic = $filename;
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Image upload failed"]);
            exit();
        }
    }

    // Check for duplicate email
    $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        http_response_code(409);
        echo json_encode(["success" => false, "error" => "Email already exists"]);
        $check->close();
        exit();
    }
    $check->close();

    // Insert user
    $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, username, email, password, country, profile_pic, typeofuser)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssss", $first_name, $last_name, $username, $email, $hashedPassword, $country, $profile_pic, $typeofuser);
    $stmt->execute();

    // =====================================================
    // ✅ Send Email Notification to Admin for New User
    // =====================================================
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';             // Your SMTP server
        $mail->SMTPAuth   = true;
            $mail->Username = 'erwin@techtreeglobal.com'; // your Gmail address
    $mail->Password = 'wnqe lrrb eilh ckgy';      // Google App Password         // Gmail App password
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;

        $mail->setFrom('erwin@techtreeglobal.com', 'Coolpage');
        $mail->addAddress('erwin@techtreeglobal.com');        // Admin notification email

        $mail->isHTML(false);
        $mail->Subject = 'New User Registered';
        $mail->Body    = "A new user has registered:\n\n" .
                         "Name: $first_name $last_name\n" .
                         "Username: $username\n" .
                         "Email: $email\n" .
                         "Country: $country\n" .
                         "Registered At: " . date("Y-m-d H:i:s") . "\n";

        $mail->send();
    } catch (Exception $e) {
        error_log("Email could not be sent. PHPMailer Error: {$mail->ErrorInfo}");
    }

    echo json_encode(["success" => true, "message" => "Registration successful"]);

    $stmt->close();
    $conn->close();

} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}
?>
