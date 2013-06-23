<?php

session_start();

include('_config.php');

$db = new mysqli(HOST, USER, PASS, 'events');

$uid = isset($_SESSION['uid']) ? $_SESSION['uid'] : -1;
$operation = isset($_GET['operation']) ? $db->real_escape_string($_GET['operation']) : '';
$eid = isset($_GET['eid']) ? $db->real_escape_string($_GET['eid']) : '';
$title = isset($_GET['title']) ? $db->real_escape_string($_GET['title']) : '';
$description = isset($_GET['description']) ? $db->real_escape_string($_GET['description']) : '';
$date = isset($_GET['date']) ? $db->real_escape_string($_GET['date']) : '';

$ret_statement = array('error' => 'false', 'msg' => '');

if ($uid != -1) {
    switch ($operation) {

        case "list_events":
            $result = $db->query("
			SELECT
			  e.eid,
			  e.title,
			  e.description,
			  e.date
			FROM
			  events AS e");
            $result_array = array();
            while ($res = $result->fetch_assoc()) {
                $result_array[] = $res;
            }
            $ret_statement['msg'] = "Listing events successfull!";
            $ret_statement['events'] = $result_array;
            break;

        case "list_users_of_event":
            if ($eid != '') {
                $result = $db->query("
				SELECT
				  u.name
				FROM
				  users AS u,
				  participations AS p
				WHERE
				  p.eid = {$eid} AND
				  u.uid = p.uid");
                $result_array = array();
                while ($res = $result->fetch_assoc()) {
                    $result_array[] = $res;
                }
                $ret_statement['msg'] = "Listing users of event successfull!";
                $ret_statement['users'] = $result_array;
            } else {
                $ret_statement['msg'] = "Error: Parameter 'eid' is empty!";
                $ret_statement['error'] = true;
            }
            break;

        case "list_tasks_of_event":
            if ($eid != '') {
                $result = $db->query("
				SELECT
				  t.tid,
				  t.title,
				  t.volume
				FROM
				  tasks AS t
				WHERE
				  t.eid = {$eid}");
                $result_array = array();
                while ($res = $result->fetch_assoc()) {
                    $result_array[] = $res;
                }
                $ret_statement['msg'] = "Listing tasks of event successfull!";
                $ret_statement['tasks'] = $result_array;
            } else {
                $ret_statement['msg'] = "Error: Parameter 'eid' is empty!";
                $ret_statement['error'] = true;
            }
            break;

        case "create":
            if ($title != '' && $description != '' && $date != '') {
                if (!$db->query("INSERT INTO events (title, description, uid, date) VALUES ('$title', '$description', '$uid', '$date')")) {
                    $ret_statement['msg'] = "Error: " . $db->error;
                    $ret_statement['error'] = true;
                } else {
                    $ret_statement['eid'] = $db->insert_id;
                    if (!$db->query("INSERT INTO participations (uid, eid) VALUES ('$uid', '$db->insert_id')")) {
                        $ret_statement['msg'] = "Error: " . $db->error;
                        $ret_statement['error'] = true;
                    }
                    $ret_statement['msg'] = "Created new event '{$title}' successfully!";
                }
            } else {
                $ret_statement['msg'] = "Error: Some parameter was empty for operation '{$operation}'!";
                $ret_statement['error'] = true;
            }
            break;

        case "join":
            if ($eid != '') {
                $result = $db->query("
				SELECT
					*
				FROM
					participations AS p
				WHERE
					p.uid = {$uid} AND
					p.eid = {$eid}");
                $_pid = $result->fetch_assoc();
                if (isset($_pid['pid'])) {
                    $ret_statement['msg'] = "Error: You already joined the event!";
                    $ret_statement['error'] = true;
                } else {
                    if (!$db->query("INSERT INTO participations (uid, eid) VALUES ('$uid', '$eid')")) {
                        $ret_statement['msg'] = "Error: " . $db->error;
                        $ret_statement['error'] = true;
                    } else {
                        $ret_statement['msg'] = "Joining the Event was successfull!";
                    }
                }
            } else {
                $ret_statement['msg'] = "Error: Parameter 'eid' is empty!";
                $ret_statement['error'] = true;
            }
            break;

        default:
            $ret_statement['error'] = true;
            $ret_statement['msg'] = "Error: Operation '{$operation}' not known!";
    }
} else {
    $ret_statement['error'] = true;
    $ret_statement['msg'] = "Error: You are not logged in!";
}


echo json_encode($ret_statement);

$db->close();
