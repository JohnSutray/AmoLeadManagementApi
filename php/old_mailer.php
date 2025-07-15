<?php


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/PHPMailer/src/Exception.php';
require_once __DIR__ . '/PHPMailer/src/SMTP.php';
require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';


function sendMailNotification() {

  if ($_SERVER['REQUEST_METHOD'] === 'POST' ) {
    try {
      $site = basename(getcwd());
      $mail = new PHPMailer(true);

      // $mail->SMTPDebug = SMTP::DEBUG_SERVER;
      $mail->isSMTP();
      $mail->Host       = 'smtp.yandex.ru';
      $mail->SMTPAuth   = true;
      $mail->Username   = 'kv7963985@yandex.ru';
      $mail->Password   = 'jwdokgfmytaikyed';
      $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
      $mail->Port       = 465;
      $mail->setFrom('kv7963985@yandex.by', $site);
      $mail->addAddress('7963985@bk.ru', 'AMO_ADMIN');
      // $mail->addCC('johnsutray@gmail.com');
      $mail->isHTML(true);
      $mail->Subject = $site;


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
      throw new ErrorException("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
    }
  }
}

?>