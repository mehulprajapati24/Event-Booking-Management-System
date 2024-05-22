const express = require("express");
const bodyParser = require("body-parser");
const user = require("./modules/user");
const admin = require("./modules/admin");
const faculty = require("./modules/faculty");
const coordinator = require("./modules/coordinator");
const upload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const env = require("dotenv");
const path = require('path');

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(upload());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


env.config();

app.use(express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      // expires: new Date(Date.now() + (3600000*24)) // 1 hour from now
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
  })
);

app.use("/theevent/user", user);
app.use("/theevent/admin", admin);
app.use("/theevent/faculty", faculty);
app.use("/theevent/coordinator", coordinator);

app.listen(3000);
