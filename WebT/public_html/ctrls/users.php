<?php

session_start();

include('_config.php');

$db = new mysqli(HOST, USER, PASS, 'events');

$operation = isset($_GET['operation']) ?  $db->real_escape_string($_GET['operation']) : '';
$name = isset($_GET['name']) ? $db->real_escape_string($_GET['name']) : '';
$password = isset($_GET['password']) ? $db->real_escape_string($_GET['password']) : '';

$ret_statement = array('error' => 'false', 'msg' => '');

switch($operation) {

case "register":
		if($name != '' && $password != '') {
			if (!$db->query("INSERT INTO users (name, password) VALUES ('$name', '$password')")) {
				$ret_statement['msg'] = "Error: " . $db->error;
				$ret_statement['error'] = true;
			}
			else {
				$ret_statement['msg'] = "Registered new user '{$name}' successfully!";
				$_SESSION['uid'] = $db->insert_id;
			}
		}
		else {
			$ret_statement['msg'] = "Error: Some parameter was empty for operation '{$operation}'!";
			$ret_statement['error'] = true;
		}
		break;

case "login":
		if($name != '' && $password != '') {
			$result = $db->query("SELECT uid FROM users WHERE name = '{$name}' AND password = '{$password}'");
			$_uid = $result->fetch_assoc();
			$uid = $_uid['uid'];
			if(isset($uid)) {
				$ret_statement['msg'] = "Login for user '{$name}' successfully!";
				$_SESSION['uid'] = $uid;
			}
			else {
				$ret_statement['msg'] = "Error: Login for user '{$name}' failed!";
				$ret_statement['error'] = true;
				unset($_SESSION['uid']);
			}
		}
		else {
			$ret_statement['msg'] = "Error: Some parameter was empty for operation '{$operation}'!";
			$ret_statement['error'] = true;
		}
		break;

case "logout":
		unset($_SESSION['uid']);
		$ret_statement['msg'] = "Logout successfull!";
		break;

case "list_events_of_user":
		if(isset($_SESSION['uid'])) {
			$result = $db->query("
				SELECT
				  e.eid,
				  e.title,
				  e.description,
				  e.date
				FROM
				  events AS e,
				  participations AS p
				WHERE
				  p.uid = {$_SESSION['uid']} AND
				  e.eid = p.eid");
			$result_array = array();
			while($res = $result->fetch_assoc()) {
				$result_array[] = $res;
			}
			$ret_statement['msg'] = "Listing events of user successfull!";
			$ret_statement['events'] = $result_array;
		}
		else {
			$ret_statement['msg'] = "Error: Not logged in!";
			$ret_statement['error'] = true;
		}
		break;

case "list_tasks_of_user":
		if(isset($_SESSION['uid'])) {
			$result = $db->query("
				SELECT
					e.eid,
					e.title AS event,
					t.title AS task,
					e.date AS due
				FROM
					assignments AS a,
					tasks AS t,
					events AS e
				WHERE
					a.uid = {$_SESSION['uid']} AND
					t.tid = a.tid AND
					e.eid = t.eid");
			$result_array = array();
			while($res = $result->fetch_assoc()) {
				$result_array[] = $res;
			}
			$ret_statement['msg'] = "Listing tasks of user successfull!";
			$ret_statement['tasks'] = $result_array;
		}
		else {
			$ret_statement['msg'] = "Error: Not logged in!";
			$ret_statement['error'] = true;
		}
		break;

	default:
		$ret_statement['error'] = true;
		$ret_statement['msg'] = "Error: Operation '{$operation}' not known!";
}

echo json_encode($ret_statement);

$db->close();
