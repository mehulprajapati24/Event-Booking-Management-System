const express = require("express");
var nodemailer = require("nodemailer");
const con = require("./connect");
const bcrypt = require("bcrypt");
const path = require("path");

const session = require("express-session");
const { verify } = require("crypto");
const jwt = require("jsonwebtoken");

const router = express.Router();


const saltRounds = 10;
var faculty_name = "";
var faculty_email = "";
router.get("/login", (req, res) => {
  res.render("facultyLogin.ejs");
});

router.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  var key = req.body.key;

  if (key == "value") {
    res.redirect(307, "/theevent/faculty/");
  } else {
    var sql = `select facultyName, facultyEmail, facultyPassword from faculty where facultyEmail=?`;
    con.query(sql, [email], (err, result) => {
      if (err) throw err;
      if (result.length == 0) {
        res.render("facultyLogin.ejs", {
          emailId: "Email Id not exists!",
          existEmailId: email,
          existPassword: password,
        });
      } else {
        faculty_name = result[0].facultyName;
        faculty_email = result[0].facultyEmail;
        bcrypt.compare(
          password,
          result[0].facultyPassword,
          (err, passwordMatch) => {
            if (err) console.log(err);
            else {
              if (passwordMatch) {
                res.redirect(307, "/theevent/faculty/");
              } else {
                res.render("facultyLogin.ejs", {
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
  }
});

function verifyToken(req, res, next) {
  const token = req.cookies["token"];
  //copy token and decode in base64
  console.log(token);
  if (!token) return res.status(401).send("Unauthorized");

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).redirect("/theevent/faculty/login"); // Redirect to login if token is expired
      } else {
        return res.status(403).send("Forbidden"); // Send Forbidden for other token errors
      }
    }
    //only stored information purpose
    req.faculty = decoded.faculty;
    next();
  });
}

router.get("/", verifyToken, (req, res) => {
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
  var sql =
    "select distinct ur.* from user_registration ur join registered_event re on ur.user_id = re.user_id join event e on re.event_id = e.id join faculty f on f.associatedDepartment = e.department where f.facultyEmail=?";
  con.query(sql, [req.faculty.facultyEmail], (err, result) => {
    if (err) {
      console.log(err);
    }

    var userOriginalID = [];
    var userName = [];
    var userEmail = [];
    var userPhone = [];
    var userGender = [];
    var userDOB = [];
    var userDepartment = [];
    var userYear = [];
    var userEnroll = [];
    var lockedProfiles = [];

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

    sql = "select * from locked_profile";
    con.query(sql, (err, result) => {
      if (err) throw err;
      for (i = 0; i < result.length; i++) {
        lockedProfiles.push(result[i].user_id);
      }
      res.render("facultyDashboard.ejs", {
        lockedProfiles: lockedProfiles,
        userOriginalID: userOriginalID,
        userName: userName,
        userEmail: userEmail,
        userPhone: userPhone,
        userGender: userGender,
        userDOB: userDOB,
        userDepartment: userDepartment,
        userYear: userYear,
        userEnroll: userEnroll,
        facultyName: req.faculty.facultyName,
        facultyEmail: req.faculty.facultyEmail,
      });
    });
  });
});

router.post("/", (req, res) => {
  console.log(faculty_name);
  // req.session.facultyName = faculty_name;
  // req.session.facultyEmail = faculty_email;
  const faculty = { facultyName: faculty_name, facultyEmail: faculty_email };
  const token = jwt.sign({ faculty }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
  res.cookie("token", token, { maxAge: 3600000 * 24, httpOnly: true });

  var sql =
    "select distinct ur.* from user_registration ur join registered_event re on ur.user_id = re.user_id join event e on re.event_id = e.id join faculty f on f.associatedDepartment = e.department where f.facultyEmail=?";
  con.query(sql, faculty_email, (err, result) => {
    if (err) {
      console.log(err);
    }

    var userOriginalID = [];
    var userName = [];
    var userEmail = [];
    var userPhone = [];
    var userGender = [];
    var userDOB = [];
    var userDepartment = [];
    var userYear = [];
    var userEnroll = [];
    var lockedProfiles = [];

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

    sql = "select * from locked_profile";
    con.query(sql, (err, result) => {
      if (err) throw err;
      for (i = 0; i < result.length; i++) {
        lockedProfiles.push(result[i].user_id);
      }
      res.render("facultyDashboard.ejs", {
        lockedProfiles: lockedProfiles,
        userOriginalID: userOriginalID,
        userName: userName,
        userEmail: userEmail,
        userPhone: userPhone,
        userGender: userGender,
        userDOB: userDOB,
        userDepartment: userDepartment,
        userYear: userYear,
        userEnroll: userEnroll,
        facultyName: faculty_name,
        facultyEmail: faculty_email,
      });
    });
  });
});

router.post("/logout", (req, res) => {
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

router.get("/forgot-password", (req, res) => {
  res.render("facultyForgotPassword.ejs");
});

router.post("/forgot-password", (req, res) => {
  var email = req.body.verifiedemail;

  var sql = `select facultyEmail,facultyName from faculty where facultyEmail=?`;
  con.query(sql, [email], (err, result) => {
    if (err) throw err;
    if (result.length == 0) {
      res.render("facultyForgotPassword.ejs", { existEmailId: email });
    } else {
      faculty_name = result[0].facultyName;

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
        res.render("facultySendOTP.ejs", {
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
  res.render("facultyNewPassword.ejs", { email: emailOfNewPassword });
});

router.post("/passwordchanged", (req, res) => {
  var email = req.body.email_id;
  var password = req.body.password;

  bcrypt.hash(password, saltRounds, (err, hashPassword) => {
    var sql = `update faculty set facultyPassword=? where facultyEmail=?;`;
    con.query(sql, [hashPassword, email], function (err, result) {
      if (err) throw err;
      console.log("Password changed successfully");

      res.redirect("/theevent/faculty/login");
    });
  });
});

router.get("/manage_event", verifyToken, (req, res) => {
  res.render("facultyEvent.ejs", { facultyName: req.faculty.facultyName });
});


router.post("/manage_event", verifyToken, (req, res) => {
  var key = req.body.key;
  console.log("Value of key:", key);

  if (key === "value") {
    res.render("facultyEvent.ejs", { facultyName: req.faculty.facultyName });
  } else {
    var file1 = req.files.eventIcon;
    var file2 = req.files.eventFlyer;
    var filename1 = file1.name;
    console.log(filename1);
    var filename2 = file2.name;
    console.log(filename2);

    var destinationPath1 = path.join(
      __dirname,
      "..",
      "assets",
      "img",
      "events",
      filename1
    );
    var destinationPath2 = path.join(
      __dirname,
      "..",
      "assets",
      "img",
      "events",
      filename2
    );

    file1.mv(destinationPath1, (err) => {
      if (err) {
        res.send(err);
      } else {
        file2.mv(destinationPath2, (err) => {
          if (err) {
            res.send(err);
          } else {
            console.log("Files moved successfully");
            faculty_email = req.faculty.facultyEmail;
            sql =
              "select associatedDepartment from faculty where facultyEmail=?";
            con.query(sql, [faculty_email], (err, result) => {
              if (err) throw err;
              department = result[0].associatedDepartment;

              const parts = req.body.eventDate.split("-");
              const formattedDate = parts[2] + "/" + parts[1] + "/" + parts[0];

              var eventStartTime =
                req.body.startHour +
                ":" +
                req.body.startMinute +
                " " +
                req.body.startPeriod;
              var eventEndTime =
                req.body.endHour +
                ":" +
                req.body.endMinute +
                " " +
                req.body.endPeriod;

              var sql =
                "insert into event(eventName, eventTagline, eventDescription, eventVenue, numberOfCoordinators, eventIcon, eventFlyer, eventDate, eventStartTime, eventEndTime, registrationFees, attendeesCapacity, department, facultyEmailId) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
              con.query(
                sql,
                [
                  req.body.eventName,
                  req.body.eventTagline,
                  req.body.eventDescription,
                  req.body.eventVenue,
                  req.body.numberOfCoordinators,
                  filename1,
                  filename2,
                  formattedDate,
                  eventStartTime,
                  eventEndTime,
                  req.body.registrationFees,
                  req.body.attendeesCapacity,
                  department,
                  faculty_email,
                ],
                (err, result) => {
                  if (err) throw err;
                  console.log("Event data added successfully");
                  res.render("facultyEvent.ejs", {
                    eventData: req.body.eventName,
                    facultyName: req.faculty.facultyName,
                  });
                }
              );
            });
          }
        });
      }
    });
  }
});

router.get("/manage_coordinator", verifyToken, (req, res) => {
    faculty_email = req.faculty.facultyEmail;
    sql = "select associatedDepartment from faculty where facultyEmail=?";
    con.query(sql, [faculty_email], (err, result) => {
      department = result[0].associatedDepartment;

      var sql =
        "SELECT eventName, department FROM event WHERE eventName NOT IN (SELECT associatedEvent FROM coordinator) AND department=?";
      var events = [];
      con.query(sql, [department], (err, result) => {
        if (err) throw err;
        for (var i = 0; i < result.length; i++) {
          events.push(result[i].eventName);
        }

        res.render("facultyCoordinator.ejs", {
          events: events,
          facultyName: req.faculty.facultyName,
        });
      });
    });
  });

router.post("/manage_coordinator", verifyToken, (req, res) => {
  var key = req.body.key;
  console.log("Value of key:", key);

  if (key === "value") {
    faculty_email = req.faculty.facultyEmail;
    sql = "select associatedDepartment from faculty where facultyEmail=?";
    con.query(sql, [faculty_email], (err, result) => {
      department = result[0].associatedDepartment;

      var sql =
        "SELECT eventName, department FROM event WHERE eventName NOT IN (SELECT associatedEvent FROM coordinator) AND department=?";
      var events = [];
      con.query(sql, [department], (err, result) => {
        if (err) throw err;
        for (var i = 0; i < result.length; i++) {
          events.push(result[i].eventName);
        }

        res.render("facultyCoordinator.ejs", {
          events: events,
          facultyName: req.faculty.facultyName,
        });
      });
    });
  } else {
    console.log(req.body);
    console.log(Object.keys(req.body).length);
    var event_name = req.body.selectedEvent;
    faculty_email = req.faculty.facultyEmail;
    sql = "select associatedDepartment from faculty where facultyEmail=?";
    con.query(sql, [faculty_email], (err, result) => {
      if (err) throw err;
      var emailIds = [];
      var coordinatorsData = [];
      department = result[0].associatedDepartment;
      var coordinatorPassword = generatePassword();

      bcrypt.hash(coordinatorPassword, saltRounds, (err, hashPassword) => {
        for (i = 1; i < Object.keys(req.body).length; i++) {
          sql =
            "insert into coordinator(coordinatorEmail, coordinatorPassword, associatedDepartment, associatedEvent) values ?";

          coordinator_email = req.body["coordinator" + i];
          emailIds.push(coordinator_email);

          coordinatorsData.push([
            coordinator_email,
            hashPassword,
            department,
            event_name,
          ]);
        }

        con.query(sql, [coordinatorsData], (err, result) => {
          if (err) throw err;
          console.log("Coordinator(s) data added successfully");

          send_mail2(
            "Coordinator of " + event_name,
            coordinatorPassword,
            "Your password is: ",
            emailIds
          );

          var sql =
            "SELECT eventName, department FROM event WHERE eventName NOT IN (SELECT associatedEvent FROM coordinator) AND department=?";
          var events = [];
          con.query(sql, [department], (err, result) => {
            if (err) throw err;
            for (var i = 0; i < result.length; i++) {
              events.push(result[i].eventName);
            }

            res.render("facultyCoordinator.ejs", {
              events: events,
              facultyName: req.faculty.facultyName,
              coordinator: "Coordinator(s)",
            });
          });
        });
      });
    });
  }
});

router.post("/eventselected", (req, res) => {
  sql = "select numberOfCoordinators,department from event where eventName=?";
  var event_name = req.body.eventName;

  con.query(sql, [event_name], (err, result) => {
    if (err) throw err;
    var noOfCoordinators = result[0].numberOfCoordinators;
    var department = result[0].department;

    sql =
      "SELECT eventName, department FROM event WHERE eventName NOT IN (SELECT associatedEvent FROM coordinator) AND department=?";
    var events = [];
    con.query(sql, [department], (err, result) => {
      if (err) throw err;
      for (var i = 0; i < result.length; i++) {
        events.push(result[i].eventName);
      }
      res.render("facultyCoordinator.ejs", {
        eventData: req.body.eventName,
        events: events,
        selectedEvent: event_name,
        noOfCoordinators: noOfCoordinators,
        facultyName: faculty_name,
      });
    });
  });
});

router.get("/eventstatistics", verifyToken, (req, res) => {
    sql = "select * from event where facultyEmailId=?";
    con.query(sql, [req.faculty.facultyEmail], (err, result) => {
      var events = [];
      for (var i = 0; i < result.length; i++) {
        events.push(result[i].eventName);
      }

      res.render("facultyEventStatistics.ejs", {
        facultyName: req.faculty.facultyName,
        events: events,
      });
    });
  });

router.post("/eventstatistics", verifyToken, (req, res) => {
  var key = req.body.key;
  console.log("Value of key:", key);

  if (key === "value") {
    sql = "select * from event where facultyEmailId=?";
    con.query(sql, [req.faculty.facultyEmail], (err, result) => {
      var events = [];
      for (var i = 0; i < result.length; i++) {
        events.push(result[i].eventName);
      }

      res.render("facultyEventStatistics.ejs", {
        facultyName: req.faculty.facultyName,
        events: events,
      });
    });
  } else {
    var selectedEvent = req.body.eventName;

    sql = "select * from event where facultyEmailId=?";
    con.query(sql, [req.faculty.facultyEmail], (err, result) => {
      var events = [];
      for (var i = 0; i < result.length; i++) {
        events.push(result[i].eventName);
      }

      sql =
        "select u.* from user_registration u join registered_event re on u.user_id = re.user_id join event e on re.event_id = e.id where e.eventName=?";
      con.query(sql, [selectedEvent], (err, result) => {
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
        res.render("facultyEventStatistics.ejs", {
          facultyName: req.faculty.facultyName,
          events: events,
          selectedEvent: selectedEvent,
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
  }
});

router.post("/lockedProfile/:user_id", (req, res) => {
  var user_id = req.params.user_id;
  sql = "insert into locked_profile(user_id) values(?);";
  con.query(sql, [user_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("profile locked");
      res.redirect(307, "/theevent/faculty/");
    }
  });
});

router.post("/unLockedProfile/:user_id", (req, res) => {
  var user_id = req.params.user_id;
  sql = "delete from locked_profile where user_id=?";
  con.query(sql, [user_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("profile unlocked");
      res.redirect(307, "/theevent/faculty/");
    }
  });
});

router.post("/manage_coordinator/edit", verifyToken, (req, res) => {
  sql =
    "select c.id as coordinatorId, c.* from coordinator c join faculty f on c.associatedDepartment = f.associatedDepartment where f.facultyEmail=?";
  con.query(sql, [req.faculty.facultyEmail], (err, result) => {
    if (err) throw err;
    var coordinatorId = [];
    var coordinatorEmail = [];
    var associatedEvent = [];

    console.log("length: " + result.length);

    for (i = 0; i < result.length; i++) {
      coordinatorId.push(result[i].coordinatorId);
      coordinatorEmail.push(result[i].coordinatorEmail);
      associatedEvent.push(result[i].associatedEvent);
    }
    res.render("editCoordinator.ejs", {
      coordinatorId: coordinatorId,
      coordinatorEmail: coordinatorEmail,
      associatedEvent: associatedEvent,
    });
  });
});

router.post("/manage_coordinator/edit/update", verifyToken, (req, res) => {
  var coordinatorId = req.body.coordinatorId;

  sql = "select * from coordinator where id=?";
  con.query(sql, [coordinatorId], (err, result) => {
    if (err) throw err;
    var coordinatorEmail = result[0].coordinatorEmail;
    var associatedEvent = result[0].associatedEvent;

    res.render("updateCoordinator.ejs", {
      coordinatorId: coordinatorId,
      coordinatorEmail: coordinatorEmail,
      associatedEvent: associatedEvent,
    });
  });
});

router.post("/manage_event/edit", verifyToken, (req, res) => {
  sql =
    "select e.id as eventId,e.* from event e join faculty f on e.department = f.associatedDepartment where f.facultyEmail=?";
  con.query(sql, [req.faculty.facultyEmail], (err, result) => {
    if (err) throw err;
    var eventId = [];
    var eventName = [];
    var eventTagline = [];
    var eventDescription = [];
    var eventVenue = [];
    var numberOfCoordinators = [];
    var eventIcon = [];
    var eventFlyer = [];
    var eventDate = [];
    var eventStartTime = [];
    var eventEndTime = [];
    var registrationFees = [];
    var attendeesCapacity = [];

    for (i = 0; i < result.length; i++) {
      eventId.push(result[i].eventId);
      eventName.push(result[i].eventName);
      eventTagline.push(result[i].eventTagline);
      eventDescription.push(result[i].eventDescription);
      eventVenue.push(result[i].eventVenue);
      numberOfCoordinators.push(result[i].numberOfCoordinators);
      eventIcon.push(result[i].eventIcon);
      eventFlyer.push(result[i].eventFlyer);
      eventDate.push(result[i].eventDate);
      eventStartTime.push(result[i].eventStartTime);
      eventEndTime.push(result[i].eventEndTime);
      registrationFees.push(result[i].registrationFees);
      attendeesCapacity.push(result[i].attendeesCapacity);
    }
    res.render("editEvent2.ejs", {
      eventId: eventId,
      eventName: eventName,
      eventTagline: eventTagline,
      eventDescription: eventDescription,
      eventVenue: eventVenue,
      numberOfCoordinators: numberOfCoordinators,
      eventIcon: eventIcon,
      eventFlyer: eventFlyer,
      eventDate: eventDate,
      eventStartTime: eventStartTime,
      eventEndTime: eventEndTime,
      registrationFees: registrationFees,
      attendeesCapacity: attendeesCapacity,
    });
  });
});

router.post(
  "/manage_coordinator/edit/updatecoordinator",
  verifyToken,
  (req, res) => {
    var coordinatorId = req.body.coordinatorId;
    var coordinatorEmail = req.body.coordinatorEmail;
    var associatedEvent = req.body.associatedEvent;
    var coordinatorPassword = generatePassword();
    console.log("coordinator id" + coordinatorId);
    bcrypt.hash(coordinatorPassword, saltRounds, (err, hashPassword) => {
      sql =
        "update coordinator set coordinatorEmail=?,coordinatorPassword=? where id=?";
      con.query(
        sql,
        [coordinatorEmail, hashPassword, coordinatorId],
        (err, result) => {
          if (err) throw err;

          console.log("coordinator's data updated successfully");
          send_mail2(
            "Coordinator of " + associatedEvent,
            coordinatorPassword,
            "Your password is: ",
            coordinatorEmail
          );
          res.redirect(307, "/theevent/faculty/manage_coordinator/edit");
        }
      );
    });
  }
);

router.post("/manage_event/edit/delete", verifyToken, (req, res) => {
  var eventId = req.body.eventId;
  sql = "DELETE FROM coordinator WHERE associatedEvent IN (SELECT eventName FROM event WHERE id = ?)";
  con.query(sql, [eventId], (err, result) => {
    if (err) throw err;
    sql = "delete from registered_event where event_id=?";
    con.query(sql, [eventId], (err, result) => {
      if (err) throw err;

      sql = "delete from event where id=?";
      con.query(sql, [eventId], (err, result) => {
        if (err) throw err;
        console.log("Event deleted successfully");
  
        res.redirect(307, "/theevent/faculty/manage_event/edit");
      });
    });
  });
});

router.post("/manage_event/edit/update", verifyToken, (req, res) => {
  var eventId = req.body.eventId;
  console.log("event id: " + eventId);
  sql = "select * from event where id=?";
  con.query(sql, [eventId], (err, result) => {
    if (err) throw err;

    var eventName = result[0].eventName;
    var eventTagline = result[0].eventTagline;
    var eventDescription = result[0].eventDescription;
    var eventVenue = result[0].eventVenue;
    var numberOfCoordinators = result[0].numberOfCoordinators;
    var eventIcon = result[0].eventIcon;
    var eventFlyer = result[0].eventFlyer;
    var eventDate = result[0].eventDate;
    var eventStartTime = result[0].eventStartTime;
    var eventEndTime = result[0].eventEndTime;
    var registrationFees = result[0].registrationFees;
    var attendeesCapacity = result[0].attendeesCapacity;

    const [day, month, year] = eventDate.split("/");
    eventDate = `${year}-${month}-${day}`;

    const [time1, period1] = eventStartTime.split(" ");
    const [hours1, minutes1] = time1.split(":");

    const [time2, period2] = eventEndTime.split(" ");
    const [hours2, minutes2] = time2.split(":");

    res.render("updateEvent2.ejs", {
      eventId: eventId,
      eventName: eventName,
      eventTagline: eventTagline,
      eventDescription: eventDescription,
      eventVenue: eventVenue,
      numberOfCoordinators: numberOfCoordinators,
      eventIcon: eventIcon,
      eventFlyer: eventFlyer,
      eventDate: eventDate,
      registrationFees: registrationFees,
      attendeesCapacity: attendeesCapacity,
      hours1: hours1,
      minutes1: minutes1,
      period1: period1,
      hours2: hours2,
      minutes2: minutes2,
      period2: period2,
    });
  });
});

router.post("/manage_event/edit/updateevent", verifyToken, (req, res) => {
  var eventId = req.body.eventId;

  var file1 = req.files.eventIcon;
  var file2 = req.files.eventFlyer;
  var filename1 = file1.name;
  var filename2 = file2.name;

  var destinationPath1 = path.join(
    __dirname,
    "..",
    "assets",
    "img",
    "events",
    filename1
  );
  var destinationPath2 = path.join(
    __dirname,
    "..",
    "assets",
    "img",
    "events",
    filename2
  );

  file1.mv(destinationPath1, (err) => {
    if (err) {
      res.send(err);
    } else {
      file2.mv(destinationPath2, (err) => {
        if (err) {
          res.send(err);
        } else {
          faculty_email = req.faculty.facultyEmail;

          sql = "select associatedDepartment from faculty where facultyEmail=?";
          con.query(sql, [faculty_email], (err, result) => {
            if (err) throw err;
            department = result[0].associatedDepartment;

            const parts = req.body.eventDate.split("-");
            const formattedDate = parts[2] + "/" + parts[1] + "/" + parts[0];

            var eventStartTime =
              req.body.startHour +
              ":" +
              req.body.startMinute +
              " " +
              req.body.startPeriod;
            var eventEndTime =
              req.body.endHour +
              ":" +
              req.body.endMinute +
              " " +
              req.body.endPeriod;

            var sql =
              "update event set eventName=?, eventTagline=?, eventDescription=?, eventVenue=?, numberOfCoordinators=?, eventIcon=?, eventFlyer=?, eventDate=?, eventStartTime=?, eventEndTime=?, registrationFees=?, attendeesCapacity=?, department=?, facultyEmailId=? where id=?";
            con.query(
              sql,
              [
                req.body.eventName,
                req.body.eventTagline,
                req.body.eventDescription,
                req.body.eventVenue,
                req.body.numberOfCoordinators,
                filename1,
                filename2,
                formattedDate,
                eventStartTime,
                eventEndTime,
                req.body.registrationFees,
                req.body.attendeesCapacity,
                department,
                faculty_email,
                eventId,
              ],
              (err, result) => {
                if (err) throw err;
                console.log("Event data updated successfully");
                res.redirect(307, "/theevent/faculty/manage_event/edit");
              }
            );
          });
        }
      });
    }
  });
});

function generatePassword() {
  const length = 6;
  const charset =
    "@#$&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&*0123456789abcdefghijklmnopqrstuvwxyz";
  let password = "";
  for (let i = 0; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * 82));
  }
  return password;
}

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
      "Hello " +
      faculty_name +
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

function send_mail2(name, password, text, emailIds) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mehulprajapati1661@gmail.com",
      pass: process.env.PASS_KEY,
    },
  });

  var mailOptions = {
    from: "mehulprajapati1661@gmail.com",
    to: emailIds,
    subject:
      "Password for login into the Event Booking Management System as a COORDINATOR",
    text:
      "Hello " +
      name +
      "\n" +
      text +
      password +
      "\n" +
      "Login through your email id",
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
