const express = require('express');
var app = express();
var session = session = require('express-session');
const router = express.Router();
//var cookieParser = require('cookie-parser');
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
	var mystr='hello';
	res.render('main',{user:req.session.user});//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//myveryownvariable != abstractjavascriptvariableforejsfilewithnoidejs
});

app.get('/login', function(req,res){
	res.render('login', {message: "", user:req.session.user});
});

app.post('/login', function(req,res){
	var auth;
		pg.connect(connectionString, (err, client, done) => {
		if(err) {
		  done();
		  console.log(err);
		  return res.status(500).json({success: false, data: err});
		}
		const query = client.query('SELECT * FROM users where username=($1)', [req.body.username]);
		query.on('row', (row) => {
			if(row.password == req.body.password)
			{
				auth = true;
				req.session.user = row.username;
				req.session.admin = row.admin;
				req.session.store = [];
			}
			console.log(row);
		});
		query.on('end', () => {
		  done();
		  console.log('auth = ' + auth);
		  if(auth == true)
		  {
			  res.render('main', {user:req.session.user});
		  }
		  else
		  {
			  res.render('login', {user:req.session.user, message: 'Authentication failed'});
		  }
		});
	});
});

app.get('/admin', function(req,res){
	if(!req.session.admin)
	{
		res.render('error', {user:req.session.user,message: 'Permission denied'});
	}
	else
	{
		res.send('ok');
	}
});

app.get('/catalog', function(req, res){
	const rows = [];
			pg.connect(connectionString, (err, client, done) => {
				if(err) {
				  done();
				  console.log(err);
				  return res.status(500).json({success: false, data: err});
				}
				console.log('query start');
				const query = client.query("SELECT * FROM catalog");
				query.on('row', (row) => {
					rows.push(row);
					console.log(row);
				});
				query.on('end', () => {
				  done();
				  console.log(rows.length);
				  res.render('catalog', {user:req.session.user, catalog:rows});
				});
			});
});

module.exports = app;