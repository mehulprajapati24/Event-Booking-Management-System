const express = require('express');
var nodemailer = require('nodemailer');
const con = require('./connect');
const bcrypt = require('bcrypt');
const path = require('path');

const passKey = require("../passKey");

const router = express.Router();

const saltRounds = 10;

router.get('/login',(req,res)=>{
    res.render("adminLogin.ejs");
});

router.post('/login',(req,res)=>{
  var username = req.body.username;
  var password = req.body.password;

  var key = req.body.key;

  if(key == "value"){
    res.redirect(307, '/theevent/admin/');
  }
  else{
    var sql = `select username, password from admin where username=?`;
    con.query(sql,[username],(err,result)=>{
        if (err) throw err;
        if(result.length == 0){
          res.render("adminLogin.ejs",{username:"Username not exists!", existUsername:username, existPassword:password});
        }
        else{
          bcrypt.compare(password, result[0].password, (err,passwordMatch)=>{
            if(err) console.log(err);
            else{
              if(passwordMatch)
              {
                res.redirect(307, '/theevent/admin/');
              }
              else
              {
                res.render("adminLogin.ejs",{password:"Password is incorrect!",existUsername:username, existPassword:password});
              }
            }
          });
        }
    });
  }
});

router.post("/", (req,res)=>{
  res.render("adminDashboard.ejs");;
})
router.post('/manage_department', (req, res) => {

    var key = req.body.key;
    console.log('Value of key:', key);

    if (key === "value") {
        res.render("adminDepartment.ejs");
    } else {

      var file = req.files.departmentIcon;
      var filename = file.name;
      console.log(filename);

      // var destinationPath = path.join(__dirname, '..', 'assets', 'img', 'departments', req.body.departmentName+filename);
      var destinationPath = path.join(__dirname, '..', 'assets', 'img', 'departments',filename);
        file.mv(destinationPath, (err)=>{
          if(err){
            res.send(err);
          }
          else{
            console.log('File moved successfully');
            var sql = "insert into department(departmentName, departmentIcon) values(?,?);";
            con.query(sql,[req.body.departmentName ,filename],(err,result)=>{
              if(err) throw err;
              console.log("Department data added successfully");
              res.render('adminDepartment.ejs', { departmentData: req.body.departmentName });
            });
          }
        });
  }
});

router.post('/manage_faculty', (req, res) => {
  var key = req.body.key;
  var departmentArray = [];
    console.log('Value of key:', key);

    var sql = "select departmentName from department";
    con.query(sql,(err,results)=> {
      for(i=0; i< results.length ; i++){
        departmentArray.push(results[i].departmentName);
      }

          if (key === "value") {
            res.render("adminFaculty.ejs", {departments: departmentArray});
        } else {
          var facultyName = req.body.facultyName;
          var facultyEmail = req.body.facultyEmail;
          var facultyPassword = generatePassword();
          var associatedDepartment = req.body.departmentName;

          sql = "select facultyEmail from faculty where facultyEmail=?";
          con.query(sql, [facultyEmail], function (err, result, fields) {
            if (err) throw err;
            if(result.length == 0){
              sql = "insert into faculty(facultyName, facultyEmail, facultyPassword, associatedDepartment) values(?,?,?,?)";
          
              bcrypt.hash(facultyPassword, saltRounds, (err,hashPassword)=>{
                con.query(sql,[facultyName ,facultyEmail, hashPassword, associatedDepartment],(err,result)=>{
                  if(err) throw err;
                  console.log("Faculty data added successfully");
                  send_mail(facultyName, facultyPassword, "Your password is: ", facultyEmail);
                  res.render('adminFaculty.ejs', { facultyData: facultyName, departments: departmentArray});
                });
              });
            }
            else{
              res.render('adminFaculty.ejs', { error: "Email ID already exists!", departments: departmentArray });
            }
          });
        }
    });
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

function send_mail(name, password, text, emailId){
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
      subject: 'Password for login into the Event Booking Management System as a FACULTY',
      text: 'Hello '+name+'\n'+ text+ password +'\n'+"Login through "+emailId + " email id"
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

