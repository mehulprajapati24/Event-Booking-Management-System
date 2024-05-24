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
    "CREATE TABLE IF NOT EXISTS event (id int primary key auto_increment, eventName varchar(50), eventTagline varchar(50), eventDescription varchar(5000), eventVenue varchar(50), numberOfCoordinators varchar(1), eventIcon varchar(100), eventFlyer varchar(100), eventDate varchar(50), eventStartTime varchar(50), eventEndTime varchar(50), registrationFees varchar(50), attendeesCapacity varchar(50), department varchar(50), facultyEmailId varchar(50))",
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

// const mysql = require("mysql");
// const env = require("dotenv");
// env.config();


// const con = mysql.createConnection({
//   host: process.env.HOST,
//   user: process.env.USER,
//   password: process.env.PASSWORD,
// });

// con.connect((err) => {
//   if (err) throw err;
//   console.log("Connected");

//   var sql1 = "CREATE DATABASE IF NOT EXISTS "+process.env.DATABASE;
//   con.query(sql1, (err, result) => {
//     if (err) throw err;
//     console.log("Database created");
//   });

//   sql2 = "USE event_management";
//   con.query(sql2, (err, result) => {
//     if (err) throw err;
//     console.log("Database selected");
//   });

//   sql3 =
//     "create table if not exists otp(created_at varchar(100) NOT NULL, email varchar(100)  primary key, otp varchar(10) NOT NULL)";
//   con.query(sql3, (err, result) => {
//     if (err) throw err;
//     console.log("otp table created");
//   });

//   sql4 =
//     "create table if not exists user_registration(user_id int primary key auto_increment, first_name varchar(50), last_name varchar(50), email_id varchar(50), phone_no varchar(50), gender varchar(10), dob varchar(50), department varchar(50), year varchar(10), enrollment_no varchar(20), password varchar(100))";

//   con.query(sql4, (err, result) => {
//     if (err) throw err;
//     console.log("user_registration table created");
//   });

//   sql5 =
//     "create table if not exists admin(id int primary key auto_increment, username varchar(50), password varchar(100))";

//   con.query(sql5, (err, result) => {
//     if (err) throw err;
//     console.log("admin table created");
//   });

//   sql6 =
//     "create table if not exists department(id int primary key auto_increment, departmentName varchar(50), departmentIcon varchar(100))";

//   con.query(sql6, (err, result) => {
//     if (err) throw err;
//     console.log("department table created");
//   });

//   sql7 =
//     "create table if not exists faculty(id int primary key auto_increment, facultyName varchar(50), facultyEmail varchar(100), facultyPassword varchar(100), associatedDepartment varchar(50))";

//   con.query(sql7, (err, result) => {
//     if (err) throw err;
//     console.log("faculty table created");
//   });

//   sql8 =
//     "create table if not exists event(id int primary key auto_increment, eventName varchar(50), eventTagline varchar(50), eventDescription varchar(5000), eventVenue varchar(50), numberOfCoordinators varchar(1), eventIcon varchar(50), eventFlyer varchar(50), eventDate varchar(50), eventStartTime varchar(50), eventEndTime varchar(50), registrationFees varchar(50), attendeesCapacity varchar(50), department varchar(50) ,facultyEmailId varchar(50))";

//   con.query(sql8, (err, result) => {
//     if (err) throw err;
//     console.log("event table created");
//   });

//   sql9 =
//     "create table if not exists coordinator(id int primary key auto_increment, coordinatorEmail varchar(50), coordinatorPassword varchar(100), associatedDepartment varchar(50), associatedEvent varchar(50))";

//   con.query(sql9, (err, result) => {
//     if (err) throw err;
//     console.log("coordinator table created");
//   });

//   sql10 =
//     "create table if not exists registered_event(user_id int, event_id int)";

//   con.query(sql10, (err, result) => {
//     if (err) throw err;
//     console.log("registered_event table created");
//   });

//   sql11 = "create table if not exists locked_profile(user_id int);";

//   con.query(sql11, (err, result) => {
//     if (err) throw err;
//     console.log("locked_profile table created");
//   });
// });

// module.exports = con;
