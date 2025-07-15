<?php

require_once 'mailer.php';

sendMailNotification();

?>

<form method="post">
    <label>
        Phone:
        <input name="phone" placeholder="phone">
    </label>

    <input type="submit" value="submit">
</form>