const mysql = require("mysql2");
const env = require("dotenv");
env.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Connect to MySQL
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id', connection.threadId);

  // Create database if not exists
  connection.query("CREATE DATABASE IF NOT EXISTS " + process.env.DATABASE, (err, result) => {
    if (err) {
      console.error('Error creating database:', err.message);
    } else {
      console.log("Database created or exists");
    }
  });

  // Select the database to use
  connection.query("USE " + process.env.DATABASE, (err, result) => {
    if (err) {
      console.error('Error selecting database:', err.message);
      connection.release();
      return;
    }
    console.log("Database selected");
  });

  // Table creation queries
  const createTables = [
    "CREATE TABLE IF NOT EXISTS otp (created_at varchar(100) NOT NULL, email varchar(100) PRIMARY KEY, otp varchar(10) NOT NULL)",
    "CREATE TABLE IF NOT EXISTS user_registration (user_id int primary key auto_increment, first_name varchar(50), last_name varchar(50), email_id varchar(50), phone_no varchar(50), gender varchar(10), dob varchar(50), department varchar(50), year varchar(10), enrollment_no varchar(20), password varchar(100))",
    "CREATE TABLE IF NOT EXISTS admin (id int primary key auto_increment, username varchar(50), password varchar(100))",
    "CREATE TABLE IF NOT EXISTS department (id int primary key auto_increment, departmentName varchar(50), departmentIcon varchar(100))",
    "CREATE TABLE IF NOT EXISTS faculty (id int primary key auto_increment, facultyName varchar(50), facultyEmail varchar(100), facultyPassword varchar(100), associatedDepartment varchar(50))",
    "CREATE TABLE IF NOT EXISTS event (id int primary key auto_increment, eventName varchar(50), eventTagline varchar(50), eventDescription varchar(5000), eventVenue varchar(50), numberOfCoordinators varchar(1), eventIcon varchar(50), eventFlyer varchar(50), eventDate varchar(50), eventStartTime varchar(50), eventEndTime varchar(50), registrationFees varchar(50), attendeesCapacity varchar(50), department varchar(50), facultyEmailId varchar(50))",
    "CREATE TABLE IF NOT EXISTS coordinator (id int primary key auto_increment, coordinatorEmail varchar(50), coordinatorPassword varchar(100), associatedDepartment varchar(50), associatedEvent varchar(50))",
    "CREATE TABLE IF NOT EXISTS registered_event (user_id int, event_id int)",
    "CREATE TABLE IF NOT EXISTS locked_profile (user_id int)"
  ];

  // Execute all table creation queries
  createTables.forEach(sql => {
    connection.query(sql, (err, result) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log("Table created or exists");
      }
    });
  });

  // Release the connection
  connection.release();
});

module.exports = pool;
