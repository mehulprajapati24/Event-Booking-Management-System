const express = require('express');
var nodemailer = require('nodemailer');
const con = require('./connect');
const bcrypt = require('bcrypt');
const path = require('path');

const session = require('express-session');
const { verify } = require('crypto');
const jwt = require("jsonwebtoken");

const router = express.Router();

const saltRounds = 10;
var faculty_name = "";
var faculty_email = "";
router.get('/login',(req,res)=>{
    res.render("facultyLogin.ejs");
});

router.post("/login",(req,res)=>{
    var email = req.body.email;
    var password = req.body.password;

    var key = req.body.key;

    if(key == "value"){
        res.redirect(307, '/theevent/faculty/');
    }
    else{
        var sql = `select facultyName, facultyEmail, facultyPassword from faculty where facultyEmail=?`;
        con.query(sql,[email],(err,result)=>{
            if (err) throw err;
            if(result.length == 0){
            res.render("facultyLogin.ejs",{emailId:"Email Id not exists!", existEmailId:email, existPassword:password});
            }
            else{

                faculty_name = result[0].facultyName;
                faculty_email = result[0].facultyEmail;
            bcrypt.compare(password, result[0].facultyPassword, (err,passwordMatch)=>{
                if(err) console.log(err);
                else{
                if(passwordMatch)
                {
                    res.redirect(307, '/theevent/faculty/');
                }
                else
                {
                    res.render("facultyLogin.ejs",{password:"Password is incorrect!",existEmailId:email, existPassword:password});
                }
                }
            });
            }
        });
    }
});

function verifyToken(req, res, next){
  const token = req.cookies['token'];
  //copy token and decode in base64
  console.log(token);
  if (!token) return res.status(401).send('Unauthorized');

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).redirect('/theevent/faculty/login'); // Redirect to login if token is expired
        } else {
            return res.status(403).send('Forbidden'); // Send Forbidden for other token errors
        }
    }
      //only stored information purpose
      req.faculty = decoded.faculty;
      next();
  });
}

router.get("/", verifyToken,(req,res)=>{
  // console.log(req.session.facultyEmail);
  // faculty_name = req.session.facultyName;
  // faculty_email = req.session.facultyEmail;
  // if(faculty_email){
  //   res.render("facultyDashboard.ejs", {facultyName: faculty_name, facultyEmail: faculty_email});
  // }
  // else{
  //   res.redirect("/theevent/faculty/login");
  // }
  console.log(req.faculty.facultyName);
  res.render("facultyDashboard.ejs", {facultyName: req.faculty.facultyName, facultyEmail: req.faculty.facultyEmail});
});

router.post("/", (req,res)=>{
    console.log(faculty_name);
    // req.session.facultyName = faculty_name;
    // req.session.facultyEmail = faculty_email;
    const faculty = {facultyName: faculty_name, facultyEmail: faculty_email};
    const token = jwt.sign({faculty}, process.env.SECRET_KEY, {expiresIn: '24h'});
    res.cookie("token",token,{maxAge:3600000 * 24, httpOnly: true});
    res.render("facultyDashboard.ejs", {facultyName: faculty_name, facultyEmail: faculty_email});
  });

router.post("/logout",(req,res)=>{
  // req.session.destroy((err)=>{
  //   if(err){
  //     console.error('Error destroying session:', err);
  //     return res.status(500).send('Internal Server Error');
  //   }
  //   res.redirect("/theevent/faculty/login");
  // })
  // Clear the JWT token by setting an expired cookie
  res.cookie("token", "", { maxAge: 0, httpOnly: true });
  res.redirect("/theevent/faculty/login");
});

router.get("/forgot-password",(req,res)=>{
    res.render("facultyForgotPassword.ejs");
});

router.post("/forgot-password",(req,res)=>{
    var email = req.body.verifiedemail;
  
    var sql = `select facultyEmail,facultyName from faculty where facultyEmail=?`;
          con.query(sql,[email],(err,result)=>{
              if (err) throw err;
              if(result.length == 0){
                res.render("facultyForgotPassword.ejs",{existEmailId:email});
              }
              else{
                faculty_name = result[0].facultyName;

                // var otp = Math.floor(Math.random() * 1000000) + 1;
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
                    res.render("facultySendOTP.ejs",{randomOtp : result[0].otp, millisecs : result[0].created_at, emailId : result[0].email, forgotpassword : "forgotpassword"});
                });
              }
            });
  });
  
router.post("/changedpassword",(req,res)=>{
    var emailOfNewPassword = req.body.emailOfNewPassword;
    res.render("facultyNewPassword.ejs",{email:emailOfNewPassword});
});

router.post("/passwordchanged", (req,res)=>{
    var email = req.body.email_id;
    var password = req.body.password;

    bcrypt.hash(password, saltRounds, (err,hashPassword)=>{
    var sql = `update faculty set facultyPassword=? where facultyEmail=?;`
    con.query(sql,[hashPassword, email],function(err,result){
        if (err) throw err;
        console.log("Password changed successfully");

        res.redirect("/theevent/faculty/login");
    });
    });
});

router.post("/manage_event", verifyToken,(req,res)=>{
    var key = req.body.key;
    console.log('Value of key:', key);

    if (key === "value") {
        res.render("facultyEvent.ejs",{facultyName: req.faculty.facultyName});
    } else {
      var file1 = req.files.eventIcon;
      var file2 = req.files.eventFlyer;
      var filename1 = file1.name;
      console.log(filename1);
      var filename2 = file2.name;
      console.log(filename2);

      var destinationPath1 = path.join(__dirname, '..', 'assets', 'img', 'events',filename1);
      var destinationPath2 = path.join(__dirname, '..', 'assets', 'img', 'events',filename2);

        file1.mv(destinationPath1, (err)=>{
          if(err){
            res.send(err);
          }
          else{
            file2.mv(destinationPath2, (err)=>{
                if(err){
                  res.send(err);
                }
                else{
                    console.log('Files moved successfully');
                    faculty_email = req.faculty.facultyEmail;
                    sql="select associatedDepartment from faculty where facultyEmail=?";
                    con.query(sql, [faculty_email], (err,result)=>{
                        if(err)throw err;
                        department = result[0].associatedDepartment;

                    const parts = req.body.eventDate.split("-");
                    const formattedDate = parts[2] + "/" + parts [1] + "/" + parts[0];


                    var eventStartTime = req.body.startHour + ":" + req.body.startMinute + " " + req.body.startPeriod;
                    var eventEndTime = req.body.endHour + ":" + req.body.endMinute + " " + req.body.endPeriod;

                    var sql = "insert into event(eventName, eventTagline, eventDescription, eventVenue, numberOfCoordinators, eventIcon, eventFlyer, eventDate, eventStartTime, eventEndTime, registrationFees, attendeesCapacity, department, facultyEmailId) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
                    con.query(sql,[req.body.eventName, req.body.eventTagline, req.body.eventDescription, req.body.eventVenue, req.body.numberOfCoordinators, filename1, filename2, formattedDate, eventStartTime, eventEndTime, req.body.registrationFees, req.body.attendeesCapacity, department, faculty_email],(err,result)=>{
                      if(err) throw err;
                      console.log("Event data added successfully");
                      res.render('facultyEvent.ejs', { eventData: req.body.eventName, facultyName: req.faculty.facultyName});
                    });
                    });
                }
              });
          }
        });
  }
});


router.post("/manage_coordinator", verifyToken,(req,res)=>{
  var key = req.body.key;
    console.log('Value of key:', key);

    if (key === "value") {
      faculty_email = req.faculty.facultyEmail;
      sql="select associatedDepartment from faculty where facultyEmail=?";
      con.query(sql, [faculty_email], (err,result)=>{
        department = result[0].associatedDepartment;

        var sql = "SELECT eventName, department FROM event WHERE eventName NOT IN (SELECT associatedEvent FROM coordinator) AND department=?";
        var events = [];
        con.query(sql, [department],(err,result)=>{
            if(err) throw err;
            for(var i=0; i<result.length;i++){
                events.push(result[i].eventName)
            }
    
            res.render("facultyCoordinator.ejs", { events: events, facultyName: req.faculty.facultyName});
        });

      });
    } else {
            console.log(req.body);
            console.log(Object.keys(req.body).length);
            var event_name = req.body.selectedEvent;
            faculty_email = req.faculty.facultyEmail;
            sql="select associatedDepartment from faculty where facultyEmail=?";
            con.query(sql, [faculty_email], (err,result)=>{
                if(err)throw err;
                var emailIds=[];
                var coordinatorsData = [];
                department = result[0].associatedDepartment;
                var coordinatorPassword = generatePassword();

                bcrypt.hash(coordinatorPassword, saltRounds, (err,hashPassword)=>{

                for(i=1; i<Object.keys(req.body).length; i++){


                  sql = "insert into coordinator(coordinatorEmail, coordinatorPassword, associatedDepartment, associatedEvent) values ?";

                  coordinator_email = req.body['coordinator'+i];
                  emailIds.push(coordinator_email);

                  coordinatorsData.push([coordinator_email, hashPassword, department, event_name]);
                }

                con.query(sql,[coordinatorsData],(err,result)=>{
                  if(err) throw err;
                  console.log("Coordinator(s) data added successfully");

                  send_mail2("Coordinator of "+event_name, coordinatorPassword, "Your password is: ", emailIds);

                  var sql = "SELECT eventName, department FROM event WHERE eventName NOT IN (SELECT associatedEvent FROM coordinator) AND department=?";
                  var events = [];
                  con.query(sql, [department],(err,result)=>{
                      if(err) throw err;
                      for(var i=0; i<result.length;i++){
                          events.push(result[i].eventName)
                      }


                      res.render("facultyCoordinator.ejs", { events: events, facultyName: req.faculty.facultyName, coordinator: "Coordinator(s)"});
                    });
                });
              });
            });
  }
});

// router.post("/manage_coordinator", verifyToken,(req,res)=>{
//   var key = req.body.key;
//     console.log('Value of key:', key);

//     if (key === "value") {
//         sql = "select eventName from event";
//         var events = [];
//         con.query(sql,(err,result)=>{
//             if(err) throw err;
//             for(var i=0; i<result.length;i++){
//                 events.push(result[i].eventName)
//             }
    
//             res.render("facultyCoordinator.ejs", { events: events, facultyName: req.faculty.facultyName});
//         });
//     } else {
//             console.log(req.body);
//             console.log(Object.keys(req.body).length);
//             var event_name = req.body.selectedEvent;
//             faculty_email = req.faculty.facultyEmail;
//             sql="select associatedDepartment from faculty where facultyEmail=?";
//             con.query(sql, [faculty_email], (err,result)=>{
//                 if(err)throw err;
//                 department = result[0].associatedDepartment;

//                 for(i=1; i<Object.keys(req.body).length; i++){

//                   var coordinatorPassword = generatePassword();

//                   sql = "insert into coordinator(coordinatorEmail, coordinatorPassword, associatedDepartment, associatedEvent) values(?, ?, ?, ?)";

//                   coordinator_email = req.body['coordinator'+i];
                  
//                   bcrypt.hash(coordinatorPassword, saltRounds, (err,hashPassword)=>{
//                     con.query(sql,[coordinator_email, hashPassword, department, event_name],(err,result)=>{
//                       if(err) throw err;
//                       console.log("Coordinator(s) data added successfully");
//                       send_mail2("Coordinator of " + event_name, coordinatorPassword, "Your password is: ", coordinator_email)
                      
//                       if(i == Object.keys(req.body)-1){
                        
//                           sql = "select eventName from event";
//                           var events = [];
//                           con.query(sql,(err,result)=>{
//                               if(err) throw err;
//                               for(var j=0; j<result.length;j++){
//                                   events.push(result[j].eventName);
//                               }

//                             res.render("facultyCoordinator.ejs", { events: events, facultyName: req.faculty.facultyName, coordinator: "Coordinator(s)"});

//                       });
//                     }
//                     });

//                   });
//                 }
//             });
//   }
// });


router.post("/eventselected",(req,res)=>{
  sql = "select numberOfCoordinators from event where eventName=?";
  var event_name = req.body.eventName;
  con.query(sql, [event_name], (err, result)=>{
    if (err) throw err;
    var noOfCoordinators = result[0].numberOfCoordinators;
    sql = "select eventName from event";
    var events = [];
    con.query(sql,(err,result)=>{
        if(err) throw err;
        for(var i=0; i<result.length;i++){
            events.push(result[i].eventName)
        }
        res.render("facultyCoordinator.ejs", { eventData: req.body.eventName, events: events, selectedEvent: event_name, noOfCoordinators: noOfCoordinators, facultyName: faculty_name});
      });
  })
});

function generatePassword() {
  const length = 6;
  const charset = "@#$&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&*0123456789abcdefghijklmnopqrstuvwxyz";
  let password = "";
  for (let i = 0; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * 82));
  }
  return password;
}

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
        text: 'Hello '+faculty_name+'\n'+ text +'\n'+"OTP: "+otp + "\n\nYour OTP would be valid only for 1 minute. Please do not share it with anyone."
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

function send_mail2(name, password, text, emailIds){
  var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mehulprajapati1661@gmail.com',
        pass: process.env.PASS_KEY
      }
    });

    var mailOptions = {
      from: 'mehulprajapati1661@gmail.com',
      to: emailIds,
      subject: 'Password for login into the Event Booking Management System as a COORDINATOR',
      text: 'Hello '+name+'\n'+ text+ password +'\n'+"Login through your email id"
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