<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/PHPMailer/src/Exception.php';
require_once __DIR__ . '/PHPMailer/src/SMTP.php';
require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';

try {
    $message = base64_decode(explode('--message=', $argv[1])[1]);
    $site = base64_decode(explode('--site=', $argv[2])[1]);

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = 'smtp.yandex.ru';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'kv7963985@yandex.ru';
    $mail->Password   = 'jwdokgfmytaikyed';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;
    $mail->setFrom('kv7963985@yandex.by', $site);
    $mail->addAddress('johnsutray@gmail.com', 'AMO_ADMIN');
//    $mail->addAddress('7963985@bk.ru', 'AMO_ADMIN');
    // $mail->addCC('johnsutray@gmail.com');
    $mail->isHTML(true);
    $mail->Subject = $site;
    $mail->Body    = $message;
    $mail->AltBody = $message;
    $mail->send();
} catch (Exception $e) {
    throw new ErrorException("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
}

?>