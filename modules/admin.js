const express = require("express");
var nodemailer = require("nodemailer");
const con = require("./connect");
const bcrypt = require("bcrypt");
const path = require("path");
const { error } = require("console");

const router = express.Router();

const saltRounds = 10;

router.get("/login", (req, res) => {
  res.render("adminLogin.ejs");
});

router.post("/login", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  var key = req.body.key;

  if (key == "value") {
    res.redirect(307, "/theevent/admin/");
  } else {
    var sql = `select username, password from admin where username=?`;
    con.query(sql, [username], (err, result) => {
      if (err) throw err;
      if (result.length == 0) {
        res.render("adminLogin.ejs", {
          username: "Username not exists!",
          existUsername: username,
          existPassword: password,
        });
      } else {
        bcrypt.compare(password, result[0].password, (err, passwordMatch) => {
          if (err) console.log(err);
          else {
            if (passwordMatch) {
              res.redirect(307, "/theevent/admin/");
            } else {
              res.render("adminLogin.ejs", {
                password: "Password is incorrect!",
                existUsername: username,
                existPassword: password,
              });
            }
          }
        });
      }
    });
  }
});

router.post("/", (req, res) => {
  var sql = "select * from user_registration";
  con.query(sql, (err, result) => {
    if (err) throw err;

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
      res.render("adminDashboard.ejs", {
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
      });
    });
  });
});
router.post("/manage_department", (req, res) => {
  var key = req.body.key;
  console.log("Value of key:", key);

  if (key === "value") {
    res.render("adminDepartment.ejs");
  } else {
    var file = req.files.departmentIcon;
    var filename = file.name;
    console.log(filename);

    // var destinationPath = path.join(__dirname, '..', 'assets', 'img', 'departments', req.body.departmentName+filename);
    var destinationPath = path.join(
      __dirname,
      "..",
      "assets",
      "img",
      "departments",
      filename
    );
    file.mv(destinationPath, (err) => {
      if (err) {
        res.send(err);
      } else {
        console.log("File moved successfully");
        var sql =
          "insert into department(departmentName, departmentIcon) values(?,?);";
        con.query(sql, [req.body.departmentName, filename], (err, result) => {
          if (err) throw err;
          console.log("Department data added successfully");
          res.render("adminDepartment.ejs", {
            departmentData: req.body.departmentName,
          });
        });
      }
    });
  }
});

router.post("/manage_faculty", (req, res) => {
  var key = req.body.key;
  var departmentArray = [];
  console.log("Value of key:", key);

  var sql = "select departmentName from department";
  con.query(sql, (err, results) => {
    for (i = 0; i < results.length; i++) {
      departmentArray.push(results[i].departmentName);
    }

    if (key === "value") {
      res.render("adminFaculty.ejs", { departments: departmentArray });
    } else {
      var facultyName = req.body.facultyName;
      var facultyEmail = req.body.facultyEmail;
      var facultyPassword = generatePassword();
      var associatedDepartment = req.body.departmentName;

      sql = "select facultyEmail from faculty where facultyEmail=?";
      con.query(sql, [facultyEmail], function (err, result, fields) {
        if (err) throw err;
        if (result.length == 0) {
          sql =
            "insert into faculty(facultyName, facultyEmail, facultyPassword, associatedDepartment) values(?,?,?,?)";

          bcrypt.hash(facultyPassword, saltRounds, (err, hashPassword) => {
            con.query(
              sql,
              [facultyName, facultyEmail, hashPassword, associatedDepartment],
              (err, result) => {
                if (err) throw err;
                console.log("Faculty data added successfully");
                send_mail(
                  facultyName,
                  facultyPassword,
                  "Your password is: ",
                  facultyEmail
                );
                res.render("adminFaculty.ejs", {
                  facultyData: facultyName,
                  departments: departmentArray,
                });
              }
            );
          });
        } else {
          res.render("adminFaculty.ejs", {
            error: "Email ID already exists!",
            departments: departmentArray,
          });
        }
      });
    }
  });
});

router.post("/manage_event", (req, res) => {
  var key = req.body.key;
  console.log("Value of key:", key);

  if (key === "value") {
    res.render("adminEvent.ejs");
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
            faculty_email = req.body.facultyEmailId;

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
                  res.render("adminEvent.ejs", {
                    eventData: req.body.eventName,
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

router.post("/eventstatistics", (req, res) => {
  var key = req.body.key;
  console.log("Value of key:", key);

  if (key === "value") {
    sql = "select * from department";
    var departments = [];
    con.query(sql, (err, result) => {
      for (i = 0; i < result.length; i++) {
        departments.push(result[i].departmentName);
      }

      res.render("adminEventStatistics.ejs", { departments: departments });
    });
  } else {
    if (req.body.eventName) {
      sql = "select * from department";
      var departments = [];
      con.query(sql, (err, result) => {
        for (i = 0; i < result.length; i++) {
          departments.push(result[i].departmentName);
        }
        var selectedDepartment = req.body.departmentName;
        var selectedEvent = req.body.eventName;

        sql = "select * from event where department=?";
        var events = [];
        con.query(sql, [selectedDepartment], (err, result) => {
          for (i = 0; i < result.length; i++) {
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
            res.render("adminEventStatistics.ejs", {
              departments: departments,
              selectedDepartment: selectedDepartment,
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
      });
    } else {
      sql = "select * from department";
      var departments = [];
      con.query(sql, (err, result) => {
        for (i = 0; i < result.length; i++) {
          departments.push(result[i].departmentName);
        }
        var selectedDepartment = req.body.departmentName;

        sql = "select * from event where department=?";
        var events = [];
        con.query(sql, [selectedDepartment], (err, result) => {
          for (i = 0; i < result.length; i++) {
            events.push(result[i].eventName);
          }
          res.render("adminEventStatistics.ejs", {
            departments: departments,
            selectedDepartment: selectedDepartment,
            events: events,
          });
        });
      });
    }
  }
});

router.post("/logout", (req, res) => {
  res.redirect("/theevent/admin/login");
});

router.post("/lockedProfile/:user_id", (req, res) => {
  var user_id = req.params.user_id;
  sql = "insert into locked_profile(user_id) values(?);";
  con.query(sql, [user_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("profile locked");
      res.redirect(307, "/theevent/admin/");
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
      res.redirect(307, "/theevent/admin/");
    }
  });
});

router.post("/manage_department/edit", (req, res) => {
  sql = "select * from department";
  con.query(sql, (err, result) => {
    if (err) throw err;
    var departmentName = [];
    var departmentIcon = [];
    var departmentId = [];

    for (i = 0; i < result.length; i++) {
      departmentName.push(result[i].departmentName);
      departmentIcon.push(result[i].departmentIcon);
      departmentId.push(result[i].id);
    }
    res.render("editDepartment.ejs", {
      departmentName: departmentName,
      departmentIcon: departmentIcon,
      departmentId: departmentId,
    });
  });
});

router.post("/manage_faculty/edit", (req, res) => {
  sql = "select * from faculty";
  con.query(sql, (err, result) => {
    if (err) throw err;
    var facultyId = [];
    var facultyName = [];
    var facultyEmail = [];
    var associatedDepartment = [];

    for (i = 0; i < result.length; i++) {
      facultyId.push(result[i].id);
      facultyName.push(result[i].facultyName);
      facultyEmail.push(result[i].facultyEmail);
      associatedDepartment.push(result[i].associatedDepartment);
    }
    res.render("editFaculty.ejs", {
      facultyId: facultyId,
      facultyName: facultyName,
      facultyEmail: facultyEmail,
      associatedDepartment: associatedDepartment,
    });
  });
});

router.post("/manage_event/edit", (req, res) => {
  sql = "select * from event";
  con.query(sql, (err, result) => {
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
    var department = [];
    var facultyEmailId = [];

    for (i = 0; i < result.length; i++) {
      eventId.push(result[i].id);
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
      department.push(result[i].department);
      facultyEmailId.push(result[i].facultyEmailId);
    }
    res.render("editEvent.ejs", {
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
      department: department,
      facultyEmailId: facultyEmailId,
    });
  });
});

router.post("/manage_department/edit/delete", (req, res) => {
  var departmentId = req.body.departmentId;
  sql = "delete f from faculty f join department d on f.associatedDepartment=d.departmentName where d.id=?";
  con.query(sql, [departmentId], (err, result) => {
    if (err) throw err;
    sql = "delete r from registered_event r join event e on r.event_id=e.id join department d on e.department=d.departmentName where d.id=?";
    con.query(sql, [departmentId], (err, result) => {
      if (err) throw err;
      sql = "delete c from coordinator c join department d on c.associatedDepartment=d.departmentName where d.id=?";
      con.query(sql, [departmentId], (err, result) => {
        if (err) throw err;
        sql = "delete e from event e join department d on e.department=d.departmentName where d.id=?";
        con.query(sql, [departmentId], (err, result) => {
          if (err) throw err;
          sql = "delete from department where id=?";
          con.query(sql, [departmentId], (err, result) => {
            if (err) throw err;
            res.redirect(307, "/theevent/admin/manage_department/edit");
          });
        });
      });
    });
  });
});

router.post("/manage_faculty/edit/delete", (req, res) => {
  var facultyId = req.body.facultyId;
  sql = "delete from faculty where id=?";
  con.query(sql, [facultyId], (err, result) => {
    if (err) throw err;
    res.redirect(307, "/theevent/admin/manage_faculty/edit");
  });
});

router.post("/manage_event/edit/delete", (req, res) => {
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
          res.redirect(307, "/theevent/admin/manage_event/edit");
        });
    });
  });
});

router.post("/manage_department/edit/update", (req, res) => {
  var departmentId = req.body.departmentId;
  sql = "select * from department where id=?";
  con.query(sql, [departmentId], (err, result) => {
    if (err) throw err;
    var departmentName = result[0].departmentName;
    var departmentIcon = result[0].departmentIcon;
    res.render("updateDepartment.ejs", {
      departmentName: departmentName,
      departmentIcon: departmentIcon,
      departmentId: departmentId,
    });
  });
});

router.post("/manage_faculty/edit/update", (req, res) => {
  var facultyId = req.body.facultyId;
  sql = "select * from faculty where id=?";
  con.query(sql, [facultyId], (err, result) => {
    if (err) throw err;
    var facultyName = result[0].facultyName;
    var facultyEmail = result[0].facultyEmail;
    var associatedDepartment = result[0].associatedDepartment;

    var departmentArray = [];

    var sql = "select departmentName from department";
    con.query(sql, (err, results) => {
      for (i = 0; i < results.length; i++) {
        departmentArray.push(results[i].departmentName);
      }

      res.render("updateFaculty.ejs", {
        facultyId: facultyId,
        facultyName: facultyName,
        facultyEmail: facultyEmail,
        associatedDepartment: associatedDepartment,
        departments: departmentArray,
      });
    });
  });
});

router.post("/manage_event/edit/update", (req, res) => {
  var eventId = req.body.eventId;
  console.log(eventId);
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
    var department = result[0].department;
    var facultyEmailId = result[0].facultyEmailId;

    const [day, month, year] = eventDate.split("/");
    eventDate = `${year}-${month}-${day}`;

    const [time1, period1] = eventStartTime.split(" ");
    const [hours1, minutes1] = time1.split(":");

    const [time2, period2] = eventEndTime.split(" ");
    const [hours2, minutes2] = time2.split(":");

    res.render("updateEvent.ejs", {
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
      department: department,
      facultyEmailId: facultyEmailId,
      hours1: hours1,
      minutes1: minutes1,
      period1: period1,
      hours2: hours2,
      minutes2: minutes2,
      period2: period2,
    });
  });
});

router.post("/manage_department/edit/updatedepartment", (req, res) => {
  var departmentId = req.body.departmentId;
  var file = req.files.departmentIcon;
  var filename = file.name;

  // var destinationPath = path.join(__dirname, '..', 'assets', 'img', 'departments', req.body.departmentName+filename);
  var destinationPath = path.join(
    __dirname,
    "..",
    "assets",
    "img",
    "departments",
    filename
  );
  file.mv(destinationPath, (err) => {
    if (err) {
      res.send(err);
    } else {
      console.log("File moved successfully");
      sql =
        "update department set departmentName=?, departmentIcon=? where id=?";
      con.query(
        sql,
        [req.body.departmentName, filename, departmentId],
        (err, result) => {
          if (err) throw err;
          console.log("Department data updated successfully");
          res.redirect(307, "/theevent/admin/manage_department/edit");
        }
      );
    }
  });
});

router.post("/manage_faculty/edit/updatefaculty", (req, res) => {
  var facultyId = req.body.facultyId;

  var facultyName = req.body.facultyName;
  var facultyEmail = req.body.facultyEmail;
  var facultyPassword = generatePassword();
  var associatedDepartment = req.body.departmentName;

  sql =
    "update faculty set facultyName=?, facultyEmail=?, facultyPassword=?, associatedDepartment=? where id=?";

  bcrypt.hash(facultyPassword, saltRounds, (err, hashPassword) => {
    con.query(
      sql,
      [
        facultyName,
        facultyEmail,
        hashPassword,
        associatedDepartment,
        facultyId,
      ],
      (err, result) => {
        if (err) throw err;
        console.log("Faculty data updated successfully");
        send_mail(
          facultyName,
          facultyPassword,
          "Your password is: ",
          facultyEmail
        );
        res.redirect(307, "/theevent/admin/manage_faculty/edit");
      }
    );
  });
});

router.post("/manage_event/edit/updateevent", (req, res) => {
  var eventId = req.body.eventId;
  console.log("event id " + eventId);

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
          faculty_email = req.body.facultyEmailId;

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
                res.redirect(307, "/theevent/admin/manage_event/edit");
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

function send_mail(name, password, text, emailId) {
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
    subject:
      "Password for login into the Event Booking Management System as a FACULTY",
    text:
      "Hello " +
      name +
      "\n" +
      text +
      password +
      "\n" +
      "Login through " +
      emailId +
      " email id",
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
