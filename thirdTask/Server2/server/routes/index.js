const express = require('express');
var app = express();
var session = session = require('express-session');
const router = express.Router();
const pg = require('pg');
const path = require('path');
var connectionString = "postgres://postgres:ll1745ll@127.0.0.1:5432/site";
var pgClient = new pg.Client(connectionString);

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));


app.set('view engine', 'ejs');

app.get('/', function(req, res) //localhost:4000/      <-------
{
	res.send('Hello');
});


module.exports = app;