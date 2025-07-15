require_once './PHPMailer/src/SMTP.php';
require_once './PHPMailer/src/PHPMailer.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;


function sendMailNotification() {
if ($_SERVER['REQUEST_METHOD'] === 'POST' ) {
try {
$mail = new PHPMailer(true);

// $mail->SMTPDebug = SMTP::DEBUG_SERVER;
$mail->isSMTP();
$mail->Host       = 'smtp.mail.ru';
$mail->SMTPAuth   = true;
$mail->Username   = 'johnsutray@mail.ru';
$mail->Password   = 'E18t1mY94edG3vQBuKEf';
$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
$mail->Port       = 465;
$mail->setFrom('johnsutray@mail.ru', 'Mailer');
$mail->addAddress('johnsutray@gmail.com', 'Joe User');
$mail->addCC('johnsutray@gmail.com');
$mail->isHTML(true);
$mail->Subject = 'Here is the subject';


$internalfields = array("submit", "reset", "send", "filesize", "formid", "captcha_code", "recaptcha_challenge_field", "recaptcha_response_field", "g-recaptcha-response");


$sep = '<br>';
$message .= $sep;
$message .= "IP Address : ";
$message .= $_SERVER['REMOTE_ADDR'];
$message .= $sep;

foreach ($_POST as $key => $value) {
if (!in_array(strtolower($key), $internalfields)) {
if (!is_array($value)) {
$message .= ucwords(str_replace("_", " ", $key)) . " : " . $value . $sep;
} else {
$message .= ucwords(str_replace("_", " ", $key)) . " : " . implode(",", $value) . $sep;
}
}
}

$mail->Body    = $message;
$mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

$mail->send();
} catch (Exception $e) {
}
}
}

sendMailNotification();
