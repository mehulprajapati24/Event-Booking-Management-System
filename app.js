const express = require('express');
const bodyParser = require('body-parser');
const user = require('./modules/user');
const admin = require('./modules/admin');
const faculty = require('./modules/faculty');
const upload = require('express-fileupload');

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(upload());

app.use(express.static('assets')); // load static files
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/theevent/user',user);
app.use('/theevent/admin',admin);
app.use('/theevent/faculty',faculty);

app.listen(3000);

