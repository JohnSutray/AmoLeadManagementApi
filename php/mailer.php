<?php

function isWindows() {
  return substr(php_uname(), 0, 7) == "Windows";
}

function execInBackground($cmd) {
  if (isWindows()) {
    pclose(popen("start /B " . $cmd, "r"));
  } else {
    exec($cmd . " > /dev/null &");
  }
}

function getPhp() {
  if (isWindows()) {
    return 'C:\\php\\php.exe';
  }

  return 'php';
}

function sendMailNotification() {
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $site = basename(getcwd());
    $internalfields = array("submit", "reset", "send", "filesize", "formid", "captcha_code", "recaptcha_challenge_field", "recaptcha_response_field", "g-recaptcha-response");
    $sep = '<br>';
    $message = $sep;
    $message .= "IP Address : ";
    $message .= $_SERVER['REMOTE_ADDR'];
    $message .= $sep;

    $hasPhone = false;

    foreach ($_POST as $key => $value) {
      if ($key == "phone" && str_starts_with($value, '+375')) {
        $hasPhone = true;
      }

      if (!in_array(strtolower($key), $internalfields)) {
        if (!is_array($value)) {
          $message .= ucwords(str_replace("_", " ", $key)) . " : " . $value . $sep;
        } else {
          $message .= ucwords(str_replace("_", " ", $key)) . " : " . implode(",", $value) . $sep;
        }
      }
    }


    if ($hasPhone) {
      $path = __DIR__ . '/mailer_send.php';
      $command = getPhp()
        . ' ' . $path
        . ' --message=' . base64_encode($message)
        . ' --site=' . base64_encode($site);

      execInBackground($command);
    }
  }
}

?>

