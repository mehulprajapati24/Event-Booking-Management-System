const express = require('express');
var nodemailer = require('nodemailer');
const con = require('./connect');
const bcrypt = require('bcrypt');
const { error } = require('console');

const passKey = require("../passKey");

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
              res.sendFile(process.cwd() + '/views/registration2.html');
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

    var otp = Math.floor(Math.random() * 1000000) + 1;
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
  var departmentArray = [];
  var departmentIconsArray = [];
  var sql = "select departmentName, departmentIcon from department";
    con.query(sql,(err,results)=> {
      for(i=0; i< results.length ; i++){
        departmentArray.push(results[i].departmentName);
        departmentIconsArray.push(results[i].departmentIcon);
      }
      res.render("user_dashboard.ejs",{departmentNames: departmentArray, departmentIcons: departmentIconsArray});
    });
});

router.get("/forgot-password",(req,res)=>{
  res.render("forgotpasswordemail.ejs");
});

router.post("/",(req,res)=>{
  console.log(firstName);
        var departmentArray = [];
        var departmentIconsArray = [];
        var sql = "select departmentName, departmentIcon from department";
          con.query(sql,(err,results)=> {
            for(i=0; i< results.length ; i++){
              departmentArray.push(results[i].departmentName);
              departmentIconsArray.push(results[i].departmentIcon);
            }
            res.render("user_dashboard.ejs",{departmentNames: departmentArray, departmentIcons: departmentIconsArray, first_name : firstName, email_id: emailId});
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

router.get("/department",(req,res)=>{
  res.render("departmentPage.ejs",{first_name : firstName, email_id: emailId});
});

router.get("/event",(req,res)=>{
  res.render("eventPage.ejs", {first_name : firstName, email_id: emailId});
});

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
