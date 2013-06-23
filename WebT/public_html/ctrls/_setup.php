<?php
include('_config.php');

$create_database = <<<SQL
	CREATE DATABASE events DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
SQL;

$create_table_assignments = <<<SQL
	CREATE TABLE IF NOT EXISTS assignments (
	  aid int(10) NOT NULL AUTO_INCREMENT,
	  uid int(10) NOT NULL,
	  tid int(10) NOT NULL,
	  PRIMARY KEY (aid)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
SQL;

$create_table_events = <<<SQL
	CREATE TABLE IF NOT EXISTS events (
	  eid int(10) NOT NULL AUTO_INCREMENT,
	  title varchar(64) NOT NULL,
	  description varchar(256) CHARACTER SET utf32 NOT NULL,
	  uid int(10) NOT NULL,
	  date date NOT NULL,
	  PRIMARY KEY (eid),
	  UNIQUE KEY title (title)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
SQL;

$create_table_participations = <<<SQL
	CREATE TABLE IF NOT EXISTS participations (
	  pid int(10) NOT NULL AUTO_INCREMENT,
	  uid int(10) NOT NULL,
	  eid int(10) NOT NULL,
	  PRIMARY KEY (pid)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
SQL;

$create_table_tasks = <<<SQL
	CREATE TABLE IF NOT EXISTS tasks (
	  tid int(10) NOT NULL AUTO_INCREMENT,
	  eid int(10) NOT NULL,
	  title varchar(64) NOT NULL,
	  volume int(10) NOT NULL,
	  PRIMARY KEY (tid)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
SQL;

$create_table_users = <<<SQL
	CREATE TABLE IF NOT EXISTS users (
	  uid int(10) NOT NULL AUTO_INCREMENT,
	  name varchar(32) NOT NULL,
	  password varchar(128) NOT NULL,
	  PRIMARY KEY (uid),
	  UNIQUE KEY name (name)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
SQL;

$create_tables = array(
	'assignments' => $create_table_assignments,
	'events' => $create_table_events,
	'participations' => $create_table_participations,
	'tasks' => $create_table_tasks,
	'users' => $create_table_users);

$db = new mysqli(HOST, USER, PASS);

if ($db->connect_errno) {
	echo "Failed to connect to MySQL: (" 
    . $db->connect_errno . ") " . $db->connect_error . "<br />";
}

if (mysqli_query($db,$create_database)){
	echo "Database successfully created!<br />";
	$db = new mysqli(HOST, USER, PASS, 'events');

	if ($db->connect_errno) {
		echo "Failed to connect to MySQL: (" 
	    . $db->connect_errno . ") " . $db->connect_error . "<br />";
	}

	foreach ($create_tables as $key => $create_table_statement) {
		if (mysqli_query($db,$create_table_statement)){
			echo "Table {$key} successfully created! <br />";
		}
		else {
			echo "Error creating table {$key}: " . mysqli_error($db) . "<br />";
		}
	}
}
else {
	echo "Error creating database: " . mysqli_error($db) . "<br />";
}
