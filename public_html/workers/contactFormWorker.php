<?php
require '/var/www/apps.local/con.php';

$_p = json_decode(file_get_contents('php://input'), true);

    if($_p['token'] != NULL && $_p['typeOfForm'] == 'contactForm'){
        // if($_SERVER['REMOTE_ADDR']){$range = str_replace('.', '', $_SERVER['REMOTE_ADDR']);}
        // elseif($_SERVER['HTTP_X_FORWARDED_FOR'] && !$_SERVER['REMOTE_ADDR']){$range = str_replace('.', '', $_SERVER['HTTP_X_FORWARDED_FOR']);}
        // else{$range = '0';}
        
        //mysqli_query($con, "
        //INSERT INTO `general_` (`data`, `FORWARDED`, `REMOTE`, `range_`) VALUES ('".strtotime('now')."', '". //$_SERVER['HTTP_X_FORWARDED_FOR'] ."', '". $_SERVER['REMOTE_ADDR'] ."', '". $range ."')
        //");

        mysqli_query($con, "
        CREATE TABLE IF NOT EXISTS `contactForm` (
        `id` INT(11) NOT NULL AUTO_INCREMENT,
        `name` VARCHAR(128) NULL,
        `tel` VARCHAR(20) NULL, 
        `email` VARCHAR(64) NULL, 
        `message` TEXT NULL, 
        `ts` TIMESTAMP NOT NULL default CURRENT_TIMESTAMP,
        PRIMARY KEY  (`id`)
        );
        ");

        mysqli_query($con, "
        INSERT INTO `contactForm` (`name`, `tel`, `email`, `message`) VALUES ('".trim($_p['name'])."', '". trim($_p['tel']) ."', '". trim($_p['email']) ."', '". base64_decode(trim($_p['message'])) ."')
        ");

        $exist=mysqli_fetch_assoc(mysqli_query($con, "SELECT `id` FROM `contacts_machine` WHERE `email`='".trim($_p['email'])."' OR `tel` = '".trim($_p['tel'])."'"));

        // echo json_encode($exist);

        if(count($exist['id'])<1){mysqli_query($con, "INSERT INTO `contacts_machine`
        (`group_id`, `mod_block`, `gdpr_block`, `email`, `tel`) VALUES ('contact_form',0,0,'".trim($_p['email'])."','".trim($_p['tel'])."')");
        }//else{echo 'you already exist. woot!';}


        $sendTo = trim($_p['token']);
        $msg = trim($_p['message']);
        $msg = base64_decode($msg);
        $mail = trim($_p['email']);
        $name = trim($_p['name']);
        // $msg = base64_encode('<b>contact form message:</b><br>from: '.$name.'<br>email: <'.$mail.'><br>tel:'. $_p['tel'] .' <br><br>'.$msg);
    
        // $getChatUserID = mysqli_query($con, "SELECT `id` FROM `chat_owners` WHERE `uid`='". $sendTo ."' LIMIT 1");

        // $to = mysqli_fetch_assoc($getChatUserID)['id'];
    
        // if(mysqli_num_rows($getChatUserID)>=1){

        //     $m60 = strtotime('now')-60;
            
        //     mysqli_query($con, "INSERT INTO `chats_container` (`text`, `property`, `oid`, `php_ts`) VALUES('". $msg ."', 0, ". $to .", ". $m60 .");
        //     ");


    
        //     // echo json_encode([]);
    
        // }


        
            $m = "New message received on Flat18 ContactForm:\n\nFrom: " . $name . "\n" . $_p['tel'] . "\n" . $mail . "\n\n" . $msg;
            mail('eighteen@flat18.co.uk', 'New message on MHT', $m);
          



        // echo 'Got ya, '. $_p['name'] .' <i class="em em-wink"></i>';
    }