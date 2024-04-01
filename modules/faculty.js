const express = require('express');
var nodemailer = require('nodemailer');
const con = require('./connect');
const bcrypt = require('bcrypt');
const path = require('path');

const passKey = require("../passKey");

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

router.post("/",(req,res)=>{
    console.log(faculty_name);
    res.render("facultyDashboard.ejs", {facultyName: faculty_name, facultyEmail: faculty_email});
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
                res.render("forgotpasswordemail.ejs",{existEmailId:email});
              }
              else{
                faculty_name = result[0].facultyName;

                var otp = Math.floor(Math.random() * 1000000) + 1;
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

router.post("/manage_event",(req,res)=>{
    res.render("facultyEvent.ejs", {facultyName: faculty_name, facultyEmail: faculty_email});
});

router.post("/manage_coordinator",(req,res)=>{
    res.render("facultyCoordinator.ejs");
})

function send_mail(otp, text, emailId){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'mehulprajapati1661@gmail.com',
          pass: passKey
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

module.exports = router;