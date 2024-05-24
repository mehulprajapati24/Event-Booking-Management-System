const express = require("express");
var nodemailer = require("nodemailer");
const con = require("./connect");
const bcrypt = require("bcrypt");
const path = require("path");

const session = require("express-session");

const router = express.Router();

const saltRounds = 10;


router.get("/login", (req, res) => {
  res.render("coordinatorLogin.ejs");
});

router.post("/", (req, res) => {
  var email_id = req.session.email_id;
  var sql =
    "select distinct ur.*, e.eventName from user_registration ur join registered_event re on ur.user_id = re.user_id join event e on re.event_id = e.id join coordinator c on e.eventName = c.associatedEvent where c.coordinatorEmail=?";
  con.query(sql, [email_id], (err, result) => {
    if (err) throw err;

    var eventsName = [];
    var userOriginalID = [];
    var userName = [];
    var userEmail = [];
    var userPhone = [];
    var userGender = [];
    var userDOB = [];
    var userDepartment = [];
    var userYear = [];
    var userEnroll = [];

    for (i = 0; i < result.length; i++) {
      userOriginalID.push(result[i].user_id);
      userName.push(result[i].first_name + " " + result[0].last_name);
      userEmail.push(result[i].email_id);
      userPhone.push(result[i].phone_no);
      userGender.push(result[i].gender);
      userDOB.push(result[i].dob);
      userDepartment.push(result[i].department);
      userYear.push(result[i].year);
      userEnroll.push(result[i].enrollment_no);
    }

    sql = "select * from coordinator where coordinatorEmail=?";
    con.query(sql, [req.session.email_id], (err, result) => {
      if (err) throw err;
      eventsName.push(result[0].associatedEvent);
      res.render("coordinatorDashboard.ejs", {
        eventsName: eventsName,
        userOriginalID: userOriginalID,
        userName: userName,
        userEmail: userEmail,
        userPhone: userPhone,
        userGender: userGender,
        userDOB: userDOB,
        userDepartment: userDepartment,
        userYear: userYear,
        userEnroll: userEnroll,
      });
    });
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/coordinator/login");
});

router.get("/", (req, res) => {
  var email_id = req.session.email_id;
  console.log("Session data for coordinator: " + email_id);

  var sql = "select * from coordinator where coordinatorEmail=?";
  con.query(sql, [email_id], (err, result) => {
    if (result.length > 0) {
      var sql =
        "select distinct ur.*, e.eventName from user_registration ur join registered_event re on ur.user_id = re.user_id join event e on re.event_id = e.id join coordinator c on e.eventName = c.associatedEvent where c.coordinatorEmail=?";
      con.query(sql, [email_id], (err, result) => {
        if (err) throw err;

        var eventsName = [];
        var userOriginalID = [];
        var userName = [];
        var userEmail = [];
        var userPhone = [];
        var userGender = [];
        var userDOB = [];
        var userDepartment = [];
        var userYear = [];
        var userEnroll = [];

        for (i = 0; i < result.length; i++) {
          userOriginalID.push(result[i].user_id);
          userName.push(result[i].first_name + " " + result[0].last_name);
          userEmail.push(result[i].email_id);
          userPhone.push(result[i].phone_no);
          userGender.push(result[i].gender);
          userDOB.push(result[i].dob);
          userDepartment.push(result[i].department);
          userYear.push(result[i].year);
          userEnroll.push(result[i].enrollment_no);
        }

        sql = "select * from coordinator where coordinatorEmail=?";
        con.query(sql, [req.session.email_id], (err, result) => {
          if (err) throw err;
          eventsName.push(result[0].associatedEvent);
          res.render("coordinatorDashboard.ejs", {
            eventsName: eventsName,
            userOriginalID: userOriginalID,
            userName: userName,
            userEmail: userEmail,
            userPhone: userPhone,
            userGender: userGender,
            userDOB: userDOB,
            userDepartment: userDepartment,
            userYear: userYear,
            userEnroll: userEnroll,
          });
        });
      });
    } else {
      res.redirect("/coordinator/login");
    }
  });
});

router.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  var sql = `select coordinatorEmail, coordinatorPassword from coordinator where coordinatorEmail=?`;
  con.query(sql, [email], (err, result) => {
    if (err) throw err;
    if (result.length == 0) {
      res.render("coordinatorLogin.ejs", {
        emailId: "Email Id not exists!",
        existEmailId: email,
        existPassword: password,
      });
    } else {
      coordinator_email = result[0].coordinatorEmail;
      bcrypt.compare(
        password,
        result[0].coordinatorPassword,
        (err, passwordMatch) => {
          if (err) console.log(err);
          else {
            if (passwordMatch) {
              req.session.email_id = coordinator_email;
              res.redirect(307, "/coordinator/");
            } else {
              res.render("coordinatorLogin.ejs", {
                password: "Password is incorrect!",
                existEmailId: email,
                existPassword: password,
              });
            }
          }
        }
      );
    }
  });
});

router.post("/logout", (req, res) => {
  res.cookie("token", "", { maxAge: 0, httpOnly: true });
  res.redirect("/faculty/login");
});

router.get("/forgot-password", (req, res) => {
  res.render("coordinatorForgotPassword.ejs");
});

router.post("/forgot-password", (req, res) => {
  var email = req.body.verifiedemail;

  var sql = `select coordinatorEmail from coordinator where coordinatorEmail=?`;
  con.query(sql, [email], (err, result) => {
    if (err) throw err;
    if (result.length == 0) {
      res.render("coordinatorForgotPassword.ejs", { existEmailId: email });
    } else {
      // var otp = Math.floor(Math.random() * 1000000) + 1;
      var otp = Math.floor(Math.random() * 900000) + 100000;
      var milliseconds = Date.now();
      var sql = `INSERT INTO otp (created_at, email, otp) VALUES(?,?,?) ON DUPLICATE KEY UPDATE created_at=VALUES(created_at), otp=VALUES(otp)`;

      con.query(sql, [milliseconds, email, otp], function (err, result) {
        if (err) throw err;
        console.log("OTP inserted");
      });
      send_mail(otp, "Here is the OTP to change your password", email);

      sql = `select * from otp where email=?`;
      con.query(sql, [email], function (err, result) {
        if (err) throw err;
        res.render("coordinatorSendOTP.ejs", {
          randomOtp: result[0].otp,
          millisecs: result[0].created_at,
          emailId: result[0].email,
          forgotpassword: "forgotpassword",
        });
      });
    }
  });
});

router.post("/changedpassword", (req, res) => {
  var emailOfNewPassword = req.body.emailOfNewPassword;
  res.render("coordinatorNewPassword.ejs", { email: emailOfNewPassword });
});

//   router.post("/otpdone", (req,res)=>{

//   });

router.post("/passwordchanged", (req, res) => {
  var email = req.body.email_id;
  var password = req.body.password;

  bcrypt.hash(password, saltRounds, (err, hashPassword) => {
    var sql = `update coordinator set coordinatorPassword=? where coordinatorEmail=?;`;
    con.query(sql, [hashPassword, email], function (err, result) {
      if (err) throw err;
      console.log("Password changed successfully");

      res.redirect("/coordinator/login");
    });
  });
});

function send_mail(otp, text, emailId) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mehulprajapati1661@gmail.com",
      pass: process.env.PASS_KEY,
    },
  });

  var mailOptions = {
    from: "mehulprajapati1661@gmail.com",
    to: emailId,
    subject: "OTP for verification",
    text:
      "Hello coordinator," +
      "\n" +
      text +
      "\n" +
      "OTP: " +
      otp +
      "\n\nYour OTP would be valid only for 1 minute. Please do not share it with anyone.",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

module.exports = router;
