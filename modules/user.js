const express = require('express');
var nodemailer = require('nodemailer');
const con = require('./connect');
const bcrypt = require('bcrypt');
const { error } = require('console');
const Razorpay = require("razorpay");
const env = require("dotenv");
const moment = require('moment');
var crypto = require("crypto");
const util = require('util');
const conQuery = util.promisify(con.query);


env.config();


var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


const saltRounds = 10;

const router = express.Router();

var firstName = "";
var lastName = "";
var emailId = "";
var phoneNo = "";
var gender = "";
var dob = "";
var department = "";
var year = "";
var enrollmentNo = "";
var password = "";
var otp = "";

router.get('/registration', (req, res) => {
    res.render("registration1.ejs");
});

router.post('/registration', (req, res) => {
    var obj = req.body;
    firstName = obj.first_name;
    lastName = obj.last_name;
    emailId = obj.email_id;
    phoneNo = obj.phone.toString();
    gender = obj.gender;
    dob = obj.dob;

    var sql = `select email_id, password from user_registration where email_id=?`;
        con.query(sql, [emailId],(err,result)=>{
            if (err) throw err;
            if(result.length == 0){
              var departmentArray = [];
              sql = "select departmentName from department";
              con.query(sql,(err,results)=> {
                for(i=0; i< results.length ; i++){
                  departmentArray.push(results[i].departmentName);
                }
                res.render("registration2.ejs",{departments: departmentArray});
              });
            }
            else{
                  res.render("registration1.ejs",{firstname: firstName, lastname: lastName, email: emailId, phone: Number(phoneNo), gender_reg: gender, dateofbirth: dob});
                  return;
            }
        });
});

router.post('/otp',(req,res)=>{
    var obj = req.body;
    department =  obj.department;
    year = obj.year;
    enrollmentNo = obj.enrollment;
    password = obj.password;

    //var otp = Math.floor(Math.random() * 1000000) + 1;
    var otp = Math.floor(Math.random() * 900000) + 100000;
    var milliseconds = Date.now();
    var sql = `INSERT INTO otp (created_at, email, otp) VALUES(?,?,?) ON DUPLICATE KEY UPDATE created_at=VALUES(created_at), otp=VALUES(otp)`;

    con.query(sql,[milliseconds, emailId, otp],function(err,result){
        if (err) throw err;
        console.log("OTP inserted");
    });
    send_mail(otp, "Here is the OTP to create your accout", emailId);

    sql = `select * from otp where email=?`;
    con.query(sql,[emailId],function(err,result){
        if (err) throw err;
        res.render("send_OTP.ejs",{randomOtp : result[0].otp, millisecs : result[0].created_at, emailId : result[0].email});
    });
});


router.get('/login',(req,res)=>{
    res.render("login.ejs");
});

router.post('/login',(req,res)=>{
  var email_id = req.body.email;
  var password = req.body.password;

  var sql = `select first_name, email_id, password from user_registration where email_id=?`;
        con.query(sql,[email_id],(err,result)=>{
            if (err) throw err;
            if(result.length == 0){
              res.render("login.ejs",{email:"Email Id not exists!", existEmailId:email_id, existPassword:password});
            }
            else{

              firstName = result[0].first_name;
              emailId = result[0].email_id;
              bcrypt.compare(password, result[0].password, (err,result)=>{
                if(err) console.log(err);
                else{
                  if(result)
                  {
                    var departmentArray = [];
                    var departmentIconsArray = [];
                    var sql = "select departmentName, departmentIcon from department";
                      con.query(sql,(err,results)=> {
                        for(i=0; i< results.length ; i++){
                          departmentArray.push(results[i].departmentName);
                          departmentIconsArray.push(results[i].departmentIcon);
                        }
                        // res.render("user_dashboard.ejs",{departmentNames: departmentArray, departmentIcons: departmentIconsArray, first_name : firstName, email_id: emailId});
                        res.redirect(307, "/theevent/user/");
                      });
                  }
                  else
                  {
                    res.render("login.ejs",{password:"Password is incorrect!",existEmailId:email_id, existPassword:password});
                  }
                }
              });
            }
        });
});

router.get('/',(req,res)=>{
 // console.log("Cookie: "+req.cookies.emailId);
 console.log("Session data: "+req.session.email_id);
  // var emailID = req.cookies.emailId;
  // var firstNAME = req.cookies.firstName;
  var emailID = req.session.email_id;
  var firstNAME = req.session.first_name;
  var eventDetails1 = [];
  var departmentDetails1 = [];
  var eventImage1 = [];
  var eventStartTime1 = [];
  var eventEndTime1 = [];
  var eventDetails2 = [];
  var departmentDetails2 = [];
  var eventImage2 = [];
  var eventStartTime2 = [];
  var eventEndTime2 = [];
  var eventDetails3 = [];
  var departmentDetails3 = [];
  var eventImage3 = [];
  var eventStartTime3 = [];
  var eventEndTime3 = [];

        sql = "select * from event where eventDate=?";
        var today = new Date();
        var formattedDate1 = String(today.getDate()).padStart(2, '0') + "/" + String((today.getMonth() + 1)).padStart(2, '0') + "/" +today.getFullYear();
        console.log(formattedDate1);
        con.query(sql, [formattedDate1], (err, result)=>{

      for(i=0; i< result.length ; i++){
        eventDetails1.push(result[i].eventName);
        eventImage1.push(result[i].eventIcon);
        departmentDetails1.push(result[i].department);
        eventStartTime1.push(result[i].eventStartTime);
        eventEndTime1.push(result[i].eventEndTime);
      }

      sql = "select * from event where eventDate=?";
            var tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            var formattedDate2 = String(tomorrow.getDate()).padStart(2, '0') + "/" + String((tomorrow.getMonth() + 1)).padStart(2, '0') + "/" +tomorrow.getFullYear();
            console.log(formattedDate2);
            con.query(sql, [formattedDate2], (err, result)=>{
          req.session.email_id = emailId;
          req.session.first_name = firstName;
          for(i=0; i< result.length ; i++){
            eventDetails2.push(result[i].eventName);
            eventImage2.push(result[i].eventIcon);
            departmentDetails2.push(result[i].department);
            eventStartTime2.push(result[i].eventStartTime);
            eventEndTime2.push(result[i].eventEndTime);
          }

          sql = "select * from event where eventDate=?";
            var dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
            var formattedDate3 = String(dayAfterTomorrow.getDate()).padStart(2, '0') + "/" + String((dayAfterTomorrow.getMonth() + 1)).padStart(2, '0') + "/" +dayAfterTomorrow.getFullYear();
            console.log(formattedDate3);
            con.query(sql, [formattedDate3], (err, result)=>{
          req.session.email_id = emailId;
          req.session.first_name = firstName;
          for(i=0; i< result.length ; i++){
            eventDetails3.push(result[i].eventName);
            eventImage3.push(result[i].eventIcon);
            departmentDetails3.push(result[i].department);
            eventStartTime3.push(result[i].eventStartTime);
            eventEndTime3.push(result[i].eventEndTime);
          }
  if(emailID){
    var departmentArray = [];
    var departmentIconsArray = [];
    var sql = "select departmentName, departmentIcon from department";
    con.query(sql,(err,results)=> {
      for(i=0; i< results.length ; i++){
        departmentArray.push(results[i].departmentName);
        departmentIconsArray.push(results[i].departmentIcon);
      }
      res.render("user_dashboard.ejs",{departmentNames: departmentArray, departmentIcons: departmentIconsArray, first_name : firstNAME, email_id: emailID, departmentDetails1: departmentDetails1, eventDetails1: eventDetails1, eventImage1: eventImage1, eventStartTime1: eventStartTime1, eventEndTime1: eventEndTime1, departmentDetails2: departmentDetails2, eventDetails2: eventDetails2, eventImage2: eventImage2, eventStartTime2: eventStartTime2, eventEndTime2: eventEndTime2, departmentDetails3: departmentDetails3, eventDetails3: eventDetails3, eventImage3: eventImage3, eventStartTime3: eventStartTime3, eventEndTime3: eventEndTime3});
    });
  }
  else{
    var departmentArray = [];
    var departmentIconsArray = [];
    var sql = "select departmentName, departmentIcon from department";
    con.query(sql,(err,results)=> {
      for(i=0; i< results.length ; i++){
        departmentArray.push(results[i].departmentName);
        departmentIconsArray.push(results[i].departmentIcon);
      }
      res.render("user_dashboard.ejs",{departmentNames: departmentArray, departmentIcons: departmentIconsArray, departmentDetails1: departmentDetails1, eventDetails1: eventDetails1, eventImage1: eventImage1, eventStartTime1: eventStartTime1, eventEndTime1: eventEndTime1, departmentDetails2: departmentDetails2, eventDetails2: eventDetails2, eventImage2: eventImage2, eventStartTime2: eventStartTime2, eventEndTime2: eventEndTime2, departmentDetails3: departmentDetails3, eventDetails3: eventDetails3, eventImage3: eventImage3, eventStartTime3: eventStartTime3, eventEndTime3: eventEndTime3});
    });
  }
});
});
});
});

router.get("/forgot-password",(req,res)=>{
  res.render("forgotpasswordemail.ejs");
});

router.post("/",(req,res)=>{
  console.log(firstName);
        var departmentArray = [];
        var departmentIconsArray = [];
        var eventDetails1 = [];
        var departmentDetails1 = [];
        var eventImage1 = [];
        var eventStartTime1 = [];
        var eventEndTime1 = [];
        var eventDetails2 = [];
        var departmentDetails2 = [];
        var eventImage2 = [];
        var eventStartTime2 = [];
        var eventEndTime2 = [];
        var eventDetails3 = [];
        var departmentDetails3 = [];
        var eventImage3 = [];
        var eventStartTime3 = [];
        var eventEndTime3 = [];
        var sql = "select departmentName, departmentIcon from department";
          con.query(sql,(err,results)=> {
            for(i=0; i< results.length ; i++){
              departmentArray.push(results[i].departmentName);
              departmentIconsArray.push(results[i].departmentIcon);
            }
            sql = "select * from event where eventDate=?";
            var today = new Date();
            var formattedDate1 = String(today.getDate()).padStart(2, '0') + "/" + String((today.getMonth() + 1)).padStart(2, '0') + "/" +today.getFullYear();
            console.log(formattedDate1);
            con.query(sql, [formattedDate1], (err, result)=>{
          //  res.cookie("emailId",emailId,{maxAge:3600000 * 24, httpOnly: true});
          //  res.cookie("firstName",firstName,{maxAge:3600000 * 24, httpOnly: true});
          req.session.email_id = emailId;
          req.session.first_name = firstName;
          for(i=0; i< result.length ; i++){
            eventDetails1.push(result[i].eventName);
            eventImage1.push(result[i].eventIcon);
            departmentDetails1.push(result[i].department);
            eventStartTime1.push(result[i].eventStartTime);
            eventEndTime1.push(result[i].eventEndTime);
          }

          sql = "select * from event where eventDate=?";
            var tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            var formattedDate2 = String(tomorrow.getDate()).padStart(2, '0') + "/" + String((tomorrow.getMonth() + 1)).padStart(2, '0') + "/" +tomorrow.getFullYear();
            console.log(formattedDate2);
            con.query(sql, [formattedDate2], (err, result)=>{
          req.session.email_id = emailId;
          req.session.first_name = firstName;
          for(i=0; i< result.length ; i++){
            eventDetails2.push(result[i].eventName);
            eventImage2.push(result[i].eventIcon);
            departmentDetails2.push(result[i].department);
            eventStartTime2.push(result[i].eventStartTime);
            eventEndTime2.push(result[i].eventEndTime);
          }

          sql = "select * from event where eventDate=?";
            var dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
            var formattedDate3 = String(dayAfterTomorrow.getDate()).padStart(2, '0') + "/" + String((dayAfterTomorrow.getMonth() + 1)).padStart(2, '0') + "/" +dayAfterTomorrow.getFullYear();
            console.log(formattedDate3);
            con.query(sql, [formattedDate3], (err, result)=>{
          req.session.email_id = emailId;
          req.session.first_name = firstName;
          for(i=0; i< result.length ; i++){
            eventDetails3.push(result[i].eventName);
            eventImage3.push(result[i].eventIcon);
            departmentDetails3.push(result[i].department);
            eventStartTime3.push(result[i].eventStartTime);
            eventEndTime3.push(result[i].eventEndTime);
          }
            res.render("user_dashboard.ejs",{departmentNames: departmentArray, departmentIcons: departmentIconsArray, first_name : firstName, email_id: emailId, departmentDetails1: departmentDetails1, eventDetails1: eventDetails1, eventImage1: eventImage1, eventStartTime1: eventStartTime1, eventEndTime1: eventEndTime1, departmentDetails2: departmentDetails2, eventDetails2: eventDetails2, eventImage2: eventImage2, eventStartTime2: eventStartTime2, eventEndTime2: eventEndTime2, departmentDetails3: departmentDetails3, eventDetails3: eventDetails3, eventImage3: eventImage3, eventStartTime3: eventStartTime3, eventEndTime3: eventEndTime3});
        });
      });
          });
          });
});

router.post('/otpdone',(req,res)=>{

    otp=req.body.otp;
    bcrypt.hash(password, saltRounds, (err,hashPassword)=>{
      var sql = `insert into user_registration(first_name, last_name, email_id, phone_no, gender, dob, department, year, enrollment_no, password) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    con.query(sql,[firstName, lastName, emailId, phoneNo, gender, dob, department, year, enrollmentNo, hashPassword],function(err,result){
        if (err) throw err;
        console.log("User registration data inserted");

        res.redirect(307, "/theevent/user/");
    });
    });
});

router.post("/forgot-password",(req,res)=>{
  var email = req.body.verifiedemail;

  var sql = `select email_id from user_registration where email_id=?`;
        con.query(sql,[email],(err,result)=>{
            if (err) throw err;
            if(result.length == 0){
              res.render("forgotpasswordemail.ejs",{existEmailId:email});
            }
            else{
              //var otp = Math.floor(Math.random() * 1000000) + 1;
              var otp = Math.floor(Math.random() * 900000) + 100000;
              var milliseconds = Date.now();
              var sql = `INSERT INTO otp (created_at, email, otp) VALUES(?,?,?) ON DUPLICATE KEY UPDATE created_at=VALUES(created_at), otp=VALUES(otp)`;

              con.query(sql,[milliseconds, email, otp],function(err,result){
                  if (err) throw err;
                  console.log("OTP inserted");
              });
              send_mail(otp, "Here is the OTP to change your password", email);

              sql = `select * from otp where email=?`;
              con.query(sql,[email],function(err,result){
                  if (err) throw err;
                  res.render("send_OTP.ejs",{randomOtp : result[0].otp, millisecs : result[0].created_at, emailId : result[0].email, forgotpassword : "forgotpassword"});
              });
            }
          });
});

router.post("/changedpassword",(req,res)=>{
  var emailOfNewPassword = req.body.emailOfNewPassword;
  res.render("newpassword.ejs",{email:emailOfNewPassword});
});

router.post("/passwordchanged", (req,res)=>{
  var email = req.body.email_id;
  var password = req.body.password;

  bcrypt.hash(password, saltRounds, (err,hashPassword)=>{
    var sql = `update user_registration set password=? where email_id=?;`
  con.query(sql,[hashPassword, email],function(err,result){
      if (err) throw err;
      console.log("Password changed successfully");

      res.redirect("/theevent/user/login");
  });
  });
});

router.get("/department/:departmentName",(req,res)=>{
  var emailID = req.session.email_id;
  var firstNAME = req.session.first_name;
  if(emailID){
  var departmentName = req.params.departmentName;
  var sql = `select * from event where department=?;`
  con.query(sql, [departmentName] ,(err, result)=>{
    if (err) throw err;
    console.log("Events fetched successfully");
    eventNames = [];
    eventIcons = [];
    eventTagline = [];
    for(i=0; i<result.length; i++){
      eventNames.push(result[i].eventName);
      eventIcons.push(result[i].eventIcon);
      eventTagline.push(result[i].eventTagline);
    }
    res.render("departmentPage.ejs",{first_name : firstNAME, email_id: emailID, eventNames: eventNames, eventIcons: eventIcons, eventTagline: eventTagline, departmentName: departmentName});
  });
  }else{
    var departmentName = req.params.departmentName;
  var sql = `select * from event where department=?;`
  con.query(sql, [departmentName] ,(err, result)=>{
    if (err) throw err;
    console.log("Events fetched successfully");
    eventNames = [];
    eventIcons = [];
    eventTagline = [];
    for(i=0; i<result.length; i++){
      eventNames.push(result[i].eventName);
      eventIcons.push(result[i].eventIcon);
      eventTagline.push(result[i].eventTagline);
    }
    res.render("departmentPage.ejs",{eventNames: eventNames, eventIcons: eventIcons, eventTagline: eventTagline, departmentName: departmentName});
  });
}
});


function parseDate(dateString) {
  const parts = dateString.split('/');
  return new Date(parts[2], parts[1] - 1, parts[0]); // Months are 0-based
}

router.get("/event/:eventName",(req,res)=>{
  var emailID = req.session.email_id;
  var firstNAME = req.session.first_name;
  var fullName="";
  var phone_no="";

  if(emailID){

    sql = "select * from locked_profile lp join user_registration ur on lp.user_id = ur.user_id where ur.email_id=?";
    con.query(sql, [emailID], (err, result) => {

      if(result.length > 0){


        var eventName = req.params.eventName;
  var sql = `select * from event where eventName=?;`
  con.query(sql, [eventName] , (err, result)=>{
    if (err) throw err;
    console.log("Event fetched successfully");


   eventId = result[0].id;
   eventTagline = result[0].eventTagline;
   eventDescription = result[0].eventDescription;
   eventVenue = result[0].eventVenue;
   eventFlyer = result[0].eventFlyer;
   eventDate = result[0].eventDate;
   eventStartTime = result[0].eventStartTime;
   eventEndTime = result[0].eventEndTime;
   registrationFees = result[0].registrationFees;
   attendeesCapacity = result[0].attendeesCapacity;


   var eventDateString = eventDate;
   var event_date = parseDate(eventDateString);
   var todayDate = new Date();
   if(event_date < todayDate){
    res.render("eventPage2.ejs", {locked:"locked", closedRegistration: true ,MaxAttendeesReached: "yes", clashesEventsName: "empty", register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
   }
   else{

   sql = "select * from user_registration where email_id=?";
   con.query(sql, [emailID], (err, result)=>{
    if (err) throw err;
    var user_id = result[0].user_id;
    var first_name = result[0].first_name;
    var last_name = result[0].last_name;
    fullName = first_name + " " + last_name;
    phone_no = result[0].phone_no;

    sql = "select * from registered_event where user_id=? AND event_id=?";
    con.query(sql, [user_id, eventId], (err, result)=>{
      if (err) throw err;
      if(result.length == 0){

        sql = "select * from registered_event where user_id=?";
        con.query(sql, [user_id], (err, mainResult)=>{
          if (err) throw err;
          if(mainResult.length == 0)
          {
            sql = "select * from registered_event where event_id=?";
            con.query(sql, [eventId], (err, result)=>{
              if(result.length == attendeesCapacity){
                if(registrationFees==0)
                    {
                      res.render("eventPage2.ejs", {locked:"locked", MaxAttendeesReached: "yes", clashesEventsName: "empty", register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
                    }
                    else
                    {
                      res.render("eventPage.ejs", {locked:"locked", MaxAttendeesReached: "yes", clashesEventsName: "empty", clashWarning: "no", fullName : fullName, phoneNo : phone_no, emailID : emailID , key_id : process.env.RAZORPAY_KEY_ID ,register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
                    }
              }
              else{
                if(registrationFees==0)
                    {
                      res.render("eventPage2.ejs", {locked:"locked", clashesEventsName: "empty", register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
                    }
                    else
                    {
                      res.render("eventPage.ejs", {locked:"locked", clashesEventsName: "empty", clashWarning: "no", fullName : fullName, phoneNo : phone_no, emailID : emailID , key_id : process.env.RAZORPAY_KEY_ID ,register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
                    }
              }
            });
          }
          else
          {

            sql = "select * from registered_event where event_id=?";
            con.query(sql, [eventId], async (err, result)=>{
              if(result.length == attendeesCapacity){

                if(registrationFees==0)
                {
                  res.render("eventPage2.ejs", {locked:"locked", MaxAttendeesReached: "yes", clashesEventsName: "empty", register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
                }
                else
                {
                  res.render("eventPage.ejs", {locked:"locked", MaxAttendeesReached: "yes", clashesEventsName: "empty", clashWarning: "no", fullName : fullName, phoneNo : phone_no, emailID : emailID , key_id : process.env.RAZORPAY_KEY_ID ,register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
                }

              }
              else{
            registeredEvent = {
              date: "",
              startTime: "",
              endTime: ""
            };

            var clashFound = false;


            // Function to check if the selected event clashes with any existing event
            var clashesEventsName = "";
            function checkEventClash(selectedDate, selectedStartTime, selectedEndTime, event) {
              console.log(event.eventName);

              const selectedDateTimeStart = moment(selectedDate + ' ' + selectedStartTime, 'DD/MM/YYYY h:mm A');
              const selectedDateTimeEnd = moment(selectedDate + ' ' + selectedEndTime, 'DD/MM/YYYY h:mm A');
              
              console.log(selectedDateTimeStart);


                  if (event.eventDate === selectedDate) {
                      console.log("Event Date:", event.eventDate);
                      const eventStartTime = moment(event.eventDate + ' ' + event.eventStartTime, 'DD/MM/YYYY h:mm A');
                      const eventEndTime = moment(event.eventDate + ' ' + event.eventEndTime, 'DD/MM/YYYY h:mm A');

                      console.log("Event Start Time:", event.eventStartTime);
                      console.log("Event End Time:", event.eventEndTime);

                      if (
                          (selectedDateTimeStart.isBetween(eventStartTime, eventEndTime) || selectedDateTimeEnd.isBetween(eventStartTime, eventEndTime)) ||
                          (eventStartTime.isBetween(selectedDateTimeStart, selectedDateTimeEnd) || eventEndTime.isBetween(selectedDateTimeStart, selectedDateTimeEnd))
                      ) {
                          clashesEventsName = clashesEventsName + event.eventName + ", ";
                          console.log("Clash Found!");
                          return true; // Clash found
                      }
                  }


              return false; // No clash found
            }


            async function getEventData(eventId) {
              return new Promise((resolve, reject) => {
                  sql = "select * from event where id=?";
                  con.query(sql, [eventId], (err, result) => {
                      if (err) {
                          reject(err);
                      } else {
                          resolve(result[0]);
                      }
                  });
              });
          }

            async function checkClashes() {
              for (var i = 0; i < mainResult.length; i++) {
                  var eventId = mainResult[i].event_id;
                  const event = await getEventData(eventId);
                  if (checkEventClash(eventDate, eventStartTime, eventEndTime, event)) {
                      clashFound = true;
                  }
              }
          }

            await checkClashes();
            console.log(clashFound);

            if(clashFound){

              console.log(clashesEventsName);
              //from 0 index to length-1 and we get 0 to length-2 parts
             // clashesEventsName = clashesEventsName.slice(0, clashesEventsName.length-2);
              clashesEventsName = clashesEventsName.slice(0, -2);
              if(registrationFees==0)
              {
                console.log(clashesEventsName);
                res.render("eventPage2.ejs", {locked:"locked", clashesEventsName: clashesEventsName, clashWarning: "Clash found! Are you still want to proceed?" ,register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
              }
              else
              {
                console.log(clashesEventsName);
                res.render("eventPage.ejs", {locked:"locked", clashesEventsName: clashesEventsName, clashWarning: "yes", fullName : fullName, phoneNo : phone_no, emailID : emailID , key_id : process.env.RAZORPAY_KEY_ID ,register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
              }
            }else{
              if(registrationFees==0)
              {
                console.log("Clash not found!");
                res.render("eventPage2.ejs", {locked:"locked", clashesEventsName: "empty", register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
              }
              else
              {
                console.log("Clash not found!");
                res.render("eventPage.ejs", {locked:"locked", clashesEventsName: "empty", clashWarning: "no", fullName : fullName, phoneNo : phone_no, emailID : emailID , key_id : process.env.RAZORPAY_KEY_ID ,register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
              }
            }
          }
        });
        }
      });
      }
      else{
        res.render("eventPage.ejs", {locked:"locked", clashesEventsName: "empty", clashWarning: "no", fullName : fullName, phoneNo : phone_no, emailID : emailID , key_id : process.env.RAZORPAY_KEY_ID, register: "Registered", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
      }
    });
   });
  }
  });

      }else{
  var eventName = req.params.eventName;
  var sql = `select * from event where eventName=?;`
  con.query(sql, [eventName] , (err, result)=>{
    if (err) throw err;
    console.log("Event fetched successfully");


   eventId = result[0].id;
   eventTagline = result[0].eventTagline;
   eventDescription = result[0].eventDescription;
   eventVenue = result[0].eventVenue;
   eventFlyer = result[0].eventFlyer;
   eventDate = result[0].eventDate;
   eventStartTime = result[0].eventStartTime;
   eventEndTime = result[0].eventEndTime;
   registrationFees = result[0].registrationFees;
   attendeesCapacity = result[0].attendeesCapacity;


   var eventDateString = eventDate;
   var event_date = parseDate(eventDateString);
   var todayDate = new Date();
   if(event_date < todayDate){
    res.render("eventPage2.ejs", {closedRegistration: true ,MaxAttendeesReached: "yes", clashesEventsName: "empty", register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
   }
   else{

   sql = "select * from user_registration where email_id=?";
   con.query(sql, [emailID], (err, result)=>{
    if (err) throw err;
    var user_id = result[0].user_id;
    var first_name = result[0].first_name;
    var last_name = result[0].last_name;
    fullName = first_name + " " + last_name;
    phone_no = result[0].phone_no;

    sql = "select * from registered_event where user_id=? AND event_id=?";
    con.query(sql, [user_id, eventId], (err, result)=>{
      if (err) throw err;
      if(result.length == 0){

        sql = "select * from registered_event where user_id=?";
        con.query(sql, [user_id], (err, mainResult)=>{
          if (err) throw err;
          if(mainResult.length == 0)
          {
            sql = "select * from registered_event where event_id=?";
            con.query(sql, [eventId], (err, result)=>{
              if(result.length == attendeesCapacity){
                if(registrationFees==0)
                    {
                      res.render("eventPage2.ejs", {MaxAttendeesReached: "yes", clashesEventsName: "empty", register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
                    }
                    else
                    {
                      res.render("eventPage.ejs", {MaxAttendeesReached: "yes", clashesEventsName: "empty", clashWarning: "no", fullName : fullName, phoneNo : phone_no, emailID : emailID , key_id : process.env.RAZORPAY_KEY_ID ,register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
                    }
              }
              else{
                if(registrationFees==0)
                    {
                      res.render("eventPage2.ejs", {clashesEventsName: "empty", register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
                    }
                    else
                    {
                      res.render("eventPage.ejs", {clashesEventsName: "empty", clashWarning: "no", fullName : fullName, phoneNo : phone_no, emailID : emailID , key_id : process.env.RAZORPAY_KEY_ID ,register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
                    }
              }
            });
          }
          else
          {

            sql = "select * from registered_event where event_id=?";
            con.query(sql, [eventId], async (err, result)=>{
              if(result.length == attendeesCapacity){

                if(registrationFees==0)
                {
                  res.render("eventPage2.ejs", {MaxAttendeesReached: "yes", clashesEventsName: "empty", register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
                }
                else
                {
                  res.render("eventPage.ejs", {MaxAttendeesReached: "yes", clashesEventsName: "empty", clashWarning: "no", fullName : fullName, phoneNo : phone_no, emailID : emailID , key_id : process.env.RAZORPAY_KEY_ID ,register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
                }

              }
              else{
            registeredEvent = {
              date: "",
              startTime: "",
              endTime: ""
            };

            var clashFound = false;


            // Function to check if the selected event clashes with any existing event
            var clashesEventsName = "";
            function checkEventClash(selectedDate, selectedStartTime, selectedEndTime, event) {
              console.log(event.eventName);

              const selectedDateTimeStart = moment(selectedDate + ' ' + selectedStartTime, 'DD/MM/YYYY h:mm A');
              const selectedDateTimeEnd = moment(selectedDate + ' ' + selectedEndTime, 'DD/MM/YYYY h:mm A');
              
              console.log(selectedDateTimeStart);


                  if (event.eventDate === selectedDate) {
                      console.log("Event Date:", event.eventDate);
                      const eventStartTime = moment(event.eventDate + ' ' + event.eventStartTime, 'DD/MM/YYYY h:mm A');
                      const eventEndTime = moment(event.eventDate + ' ' + event.eventEndTime, 'DD/MM/YYYY h:mm A');

                      console.log("Event Start Time:", event.eventStartTime);
                      console.log("Event End Time:", event.eventEndTime);

                      if (
                          (selectedDateTimeStart.isBetween(eventStartTime, eventEndTime) || selectedDateTimeEnd.isBetween(eventStartTime, eventEndTime)) ||
                          (eventStartTime.isBetween(selectedDateTimeStart, selectedDateTimeEnd) || eventEndTime.isBetween(selectedDateTimeStart, selectedDateTimeEnd))
                      ) {
                          clashesEventsName = clashesEventsName + event.eventName + ", ";
                          console.log("Clash Found!");
                          return true; // Clash found
                      }
                  }


              return false; // No clash found
            }


            async function getEventData(eventId) {
              return new Promise((resolve, reject) => {
                  sql = "select * from event where id=?";
                  con.query(sql, [eventId], (err, result) => {
                      if (err) {
                          reject(err);
                      } else {
                          resolve(result[0]);
                      }
                  });
              });
          }

            async function checkClashes() {
              for (var i = 0; i < mainResult.length; i++) {
                  var eventId = mainResult[i].event_id;
                  const event = await getEventData(eventId);
                  if (checkEventClash(eventDate, eventStartTime, eventEndTime, event)) {
                      clashFound = true;
                  }
              }
          }

            await checkClashes();
            console.log(clashFound);

            if(clashFound){

              console.log(clashesEventsName);
              //from 0 index to length-1 and we get 0 to length-2 parts
             // clashesEventsName = clashesEventsName.slice(0, clashesEventsName.length-2);
              clashesEventsName = clashesEventsName.slice(0, -2);
              if(registrationFees==0)
              {
                console.log(clashesEventsName);
                res.render("eventPage2.ejs", {clashesEventsName: clashesEventsName, clashWarning: "Clash found! Are you still want to proceed?" ,register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
              }
              else
              {
                console.log(clashesEventsName);
                res.render("eventPage.ejs", {clashesEventsName: clashesEventsName, clashWarning: "yes", fullName : fullName, phoneNo : phone_no, emailID : emailID , key_id : process.env.RAZORPAY_KEY_ID ,register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
              }
            }else{
              if(registrationFees==0)
              {
                console.log("Clash not found!");
                res.render("eventPage2.ejs", {clashesEventsName: "empty", register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
              }
              else
              {
                console.log("Clash not found!");
                res.render("eventPage.ejs", {clashesEventsName: "empty", clashWarning: "no", fullName : fullName, phoneNo : phone_no, emailID : emailID , key_id : process.env.RAZORPAY_KEY_ID ,register: "Register", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
              }
            }
          }
        });
        }
      });
      }
      else{
        res.render("eventPage.ejs", {clashesEventsName: "empty", clashWarning: "no", fullName : fullName, phoneNo : phone_no, emailID : emailID , key_id : process.env.RAZORPAY_KEY_ID, register: "Registered", loggedIn : "yes" ,first_name : firstNAME, email_id: emailID, eventName: eventName, eventTagline: eventTagline, eventDescription: eventDescription, eventVenue: eventVenue, eventFlyer: eventFlyer, eventDate: eventDate, eventStartTime: eventStartTime, eventEndTime: eventEndTime, registrationFees: registrationFees, attendeesCapacity: attendeesCapacity});
      }
    });
   });
  }
  });
}
});
}else{
  var eventName = req.params.eventName;
  var sql = `select * from event where eventName=?;`
  con.query(sql, [eventName] , (err, result)=>{
    if (err) throw err;
    console.log("Event fetched successfully");

    res.render("eventPage.ejs", {clashesEventsName: "empty", clashWarning: "no" ,fullName : fullName, phoneNo : phone_no, emailID : emailID ,key_id : process.env.RAZORPAY_KEY_ID, register: "Register", loggedIn : "no", eventName: eventName, eventTagline: result[0].eventTagline, eventDescription: result[0].eventDescription, eventVenue: result[0].eventVenue, eventFlyer: result[0].eventFlyer, eventDate: result[0].eventDate, eventStartTime: result[0].eventStartTime, eventEndTime: result[0].eventEndTime, registrationFees: result[0].registrationFees, attendeesCapacity: result[0].attendeesCapacity});
  });
}
});


router.post('/create/orderId', (req, res)=>{ 

  var options = {
    amount: req.body.amount,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_1"
  };
  instance.orders.create(options, function(err, order) {
    	if(!err) {
        console.log(order);
			  res.send({orderId : order.id});
      }
		  else{
			  res.send(err); 
		  } 
  }); 
});



router.post("/api/payment/verify", (req,res)=>{
  let body=req.body.response.razorpay_order_id + "|" +req.body.response.razorpay_payment_id;

  var expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');
  console.log("Signature received", req.body.response.razorpay_signature);
  console.log("Signature generated", expectedSignature);

  var response = {"signatureIsValid":"false"};
  if(expectedSignature === req.body.response.razorpay_signature){
    response = {"signatureIsValid":"true"};
  }
  res.send(response);
});


router.post("/successpayment/:eventName",(req,res)=>{
    var emailID = req.session.email_id;
    var firstNAME = req.session.first_name;
    var eventName = req.params.eventName;
    var sql = `select * from event where eventName=?;`

    con.query(sql, [eventName] , (err, result)=>{
      if (err) throw err;
      eventId = result[0].id;

      sql = `select user_id from user_registration where email_id=?;`
      con.query(sql, [emailID] , (err, result)=>{
        if (err) throw err;
        userId = result[0].user_id;

        sql = `insert into registered_event values(?,?)`;
        con.query(sql, [userId, eventId] , (err, result)=>{
          if (err) throw err;
          console.log("Event registered successfully");
          res.redirect("/theevent/user/event/"+eventName);
        });
      });
    });
});

async function registeredEvents(eventId){
  return new Promise((resolve, reject) => {
    sql = "select * from event where id=?";
    con.query(sql, [eventId], (err, result) => {
        if (err) {
            reject(err);
        } else {
            resolve(result[0]);
        }
    });
});
}
router.post("/registeredevents", (req,res)=>{
  var emailID = req.session.email_id;
  var firstNAME = req.session.first_name;
  //console.log(emailID);
  var name = [];
  var venue = [];
  var time = [];
  var date = [];
  var department = [];

  var sql = "select user_id from user_registration where email_id=?";
  con.query(sql, [emailID], (err,result)=>{
    var userId = result[0].user_id;
    //console.log(userId);
    var sql = "select event_id from registered_event where user_id=?";
    con.query(sql, [userId], async (err,result)=>{

      if(result.length > 0){
        for(i=0; i<result.length; i++){
          var eventId = result[i].event_id;

          var event = await registeredEvents(eventId);
          name.push(event.eventName);
          venue.push(event.eventVenue);
          date.push(event.eventDate);
          time.push(event.eventStartTime + " to " + event.eventEndTime);
          department.push(event.department);
        }
        //console.log(name);
        res.render("registeredEvents.ejs",{first_name: firstNAME, registered: true, name: name, venue: venue, date: date, time: time, department: department});
      }
      else{
        res.render("registeredEvents.ejs",{first_name: firstNAME, registered: false});
      }
    });
  });
})



router.get("/logout",(req,res)=>{
  req.session.destroy();
  res.redirect("/theevent/user/login");
});



function send_mail(otp, text, emailId){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'mehulprajapati1661@gmail.com',
          pass: process.env.PASS_KEY
        }
      });

      var mailOptions = {
        from: 'mehulprajapati1661@gmail.com',
        to: emailId,
        subject: 'OTP for verification',
        text: 'Hello '+firstName+'\n'+ text +'\n'+"OTP: "+otp + "\n\nYour OTP would be valid only for 1 minute. Please do not share it with anyone."
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

module.exports = router;
