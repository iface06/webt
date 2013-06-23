<?php

session_start();

include('_config.php');

$db = new mysqli(HOST, USER, PASS, 'events');

$uid = isset($_SESSION['uid']) ?  $_SESSION['uid'] : -1;
$operation = isset($_GET['operation']) ?  $db->real_escape_string($_GET['operation']) : '';
$title = isset($_GET['title']) ?  $db->real_escape_string($_GET['title']) : '';
$volume = isset($_GET['volume']) ?  $db->real_escape_string($_GET['volume']) : '';
$eid = isset($_GET['eid']) ?  $db->real_escape_string($_GET['eid']) : '';
$tid = isset($_GET['tid']) ?  $db->real_escape_string($_GET['tid']) : '';

$ret_statement = array('error' => 'false', 'msg' => '');

if($uid != -1) {
	switch($operation) {

case "create":
		if($title != '' && $volume != '' && $eid != '') {
			$result = $db->query("
				SELECT
					*
				FROM
					events AS e
				WHERE
					e.uid = {$uid} AND
					e.eid = {$eid}");
			$_eid = $result->fetch_assoc();
			if(isset($_eid['eid'])) { 
				if (!$db->query("INSERT INTO tasks (eid, title, volume) VALUES ('$eid', '$title', '$volume')")) {
					$ret_statement['msg'] = "Error: " . $db->error;
					$ret_statement['error'] = true;
				}
				else {
					$ret_statement['msg'] = "Created new task '{$title}' successfully!";
				}
			}
			else {
				$ret_statement['msg'] = "Error: You are not the owner of that event!";
				$ret_statement['error'] = true;
			}	
		}
		else {
			$ret_statement['msg'] = "Error: Some parameter was empty for operation '{$operation}'!";
			$ret_statement['error'] = true;
		}
		break;

case "assign":
		if($tid != '') {
			$result = $db->query("
				SELECT
					p.*
				FROM
					tasks AS t,
					participations AS p
				WHERE
					t.tid = {$tid} AND
					p.eid = t.eid AND
					p.uid = {$uid}");
			$_pid = $result->fetch_assoc();
			if(isset($_pid['pid'])) {
				$result = $db->query("
					SELECT volume - COALESCE(assignments, 0) AS freeSlots
					FROM (
					    SELECT tid, volume
					    FROM tasks
					    WHERE tid = {$tid}
					) t
					LEFT JOIN (
					    SELECT tid, count(*) as assignments
					    FROM assignments
					    WHERE tid = {$tid}
					) a
					ON t.tid = a.tid");
				$_freeSlots = $result->fetch_assoc(); 
				$freeSlots = $_freeSlots['freeSlots'];
				if($freeSlots > 0) {
					if (!$db->query("INSERT INTO assignments (uid, tid) VALUES ('$uid', '$tid')")) {
						$ret_statement['msg'] = "Error: " . $db->error;
						$ret_statement['error'] = true;
					}
					else {
						$ret_statement['msg'] = "You successfully joined the task!";
					}
				}
				else {
					$ret_statement['msg'] = "Error: Sorry this task has no free slots!";
					$ret_statement['error'] = true;
				}
			}
			else {
				$ret_statement['msg'] = "Error: You are not a participant of that event!";
				$ret_statement['error'] = true;
			}	
		}
		else {
			$ret_statement['msg'] = "Error: Some parameter was empty for operation '{$operation}'!";
			$ret_statement['error'] = true;
		}
		break;

case "list_users_of_task":
		if($tid != '') {
			$result = $db->query("
				SELECT
				  u.name
				FROM
				  users AS u,
				  assignments AS a
				WHERE
				  a.tid = {$tid} AND
				  u.uid = a.uid");
			$result_array = array();
			while($res = $result->fetch_assoc()) {
				$result_array[] = $res;
			}
			$ret_statement['msg'] = "Listing users of task successfull!";
			$ret_statement['users'] = $result_array;
		}
		else {
			$ret_statement['msg'] = "Error: Parameter 'tid' is empty!";
			$ret_statement['error'] = true;
		}
		break;

		default:
			$ret_statement['error'] = true;
			$ret_statement['msg'] = "Error: Operation '{$operation}' not known!";
	}
}
else {
	$ret_statement['error'] = true;
	$ret_statement['msg'] = "Error: You are not logged in!";
}

echo json_encode($ret_statement);

$db->close();
