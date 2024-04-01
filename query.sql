-- create database
CREATE DATABASE IF NOT EXISTS event_management;

-- select database
USE event_management;

-- create table for user to registration
otp=req.body.otp;
    console.log(firstName, lastName, emailId, phoneNo, gender, dob, department, year, enrollmentNo,password, otp);
create table user_registration(user_id int primary key auto_increment, first_name varchar(50), last_name varchar(50), email_id varchar(50) unique, phone_no varchar(50), gender varchar(10), dob varchar(50), department varchar(50), year varchar(10), enrollment_no varchar(20) unique, password varchar(100));

-- create table for faculty
create table faculty(faculty_id int primary key auto_increment, email_id varchar(100) primary key, password varchar(30) unique not null, department varchar(30) not null);

-- insert creadentials of faculty
insert  into faculty values();

-- create table for otp
create table if not exists otp(create_at varchar(100) NOT NULL, email varchar(100)  NOT NULL, otp varchar(10) NOT NULL);
insert into otp values(milliseconds, emailId, randomOtp);
select  * from otp where email=emailId;
