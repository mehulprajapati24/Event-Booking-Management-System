const mysql = require('mysql');
const bcrypt = require('bcrypt');

const con = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
});

con.connect((err)=>{
    if (err) throw err;
    console.log("Connected");

    var sql1 = "CREATE DATABASE IF NOT EXISTS event_management";
    con.query(sql1,(err,result)=>{
        if (err) throw err;
        console.log("Database created");
    });

    sql2 = "USE event_management";
    con.query(sql2,(err,result)=>{
        if (err) throw err;
        console.log("Database selected");
    });

    sql3 = "create table if not exists otp(created_at varchar(100) NOT NULL, email varchar(100)  primary key, otp varchar(10) NOT NULL)";
    con.query(sql3,(err,result)=>{
        if (err) throw err;
        console.log("otp table created");
    });

    sql4 = "create table if not exists user_registration(user_id int primary key auto_increment, first_name varchar(50), last_name varchar(50), email_id varchar(50), phone_no varchar(50), gender varchar(10), dob varchar(50), department varchar(50), year varchar(10), enrollment_no varchar(20), password varchar(100))";

    con.query(sql4,(err,result)=>{
        if (err) throw err;
        console.log("user_registration table created");
    });

    sql5 = "create table if not exists admin(id int primary key auto_increment, username varchar(50), password varchar(100))";

    con.query(sql5,(err,result)=>{
        if (err) throw err;
        console.log("admin table created")
    });


    sql6 = "create table if not exists department(id int primary key auto_increment, departmentName varchar(50), departmentIcon varchar(100))";

    con.query(sql6,(err,result)=>{
        if (err) throw err;
        console.log("department table created")
    });

    sql7 = "create table if not exists faculty(id int primary key auto_increment, facultyName varchar(50), facultyEmail varchar(100), facultyPassword varchar(100), associatedDepartment varchar(50))";

    con.query(sql7,(err,result)=>{
        if (err) throw err;
        console.log("faculty table created")
    });

    sql8 = "create table if not exists event(id int primary key auto_increment, eventName varchar(50), eventTagline varchar(50), eventDescription varchar(5000), eventVenue varchar(50), numberOfCoordinators varchar(1), eventIcon varchar(50), eventFlyer varchar(50), eventDate varchar(50), eventStartTime varchar(50), eventEndTime varchar(50), registrationFees varchar(50), attendeesCapacity varchar(50), department varchar(50) ,facultyEmailId varchar(50))";

    con.query(sql8,(err,result)=>{
        if (err) throw err;
        console.log("event table created");
    });

    sql9 = "create table if not exists coordinator(id int primary key auto_increment, coordinatorEmail varchar(50), coordinatorPassword varchar(100), associatedDepartment varchar(50), associatedEvent varchar(50))";

    con.query(sql9, (err,result)=>{
        if (err) throw err;
        console.log("coordinator table created");
    });

    sql10 = "create table if not exists registered_event(user_id int, event_id int)";

    con.query(sql10, (err,result)=>{
        if (err) throw err;
        console.log("registered_event table created");
    });

    sql11 = "create table if not exists locked_profile(user_id int);"

    con.query(sql11, (err,result)=>{
        if (err) throw err;
        console.log("locked_profile table created");
    });
});


module.exports = con;