const express = require('express');
var app = express();
var session = session = require('express-session');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const exec = require("child_process").exec
var connectionString = "postgres://postgres:ll1745ll@127.0.0.1:5432/HeavyTasks";
var randomstring = require("randomstring");
var pgClient = new pg.Client(connectionString);

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));


app.set('view engine', 'ejs');

app.get('/', function(req, res) //localhost:4000/
{
	res.render('main',{user:req.session.user});
});

app.get('/filter', function(req, res) 
{		
	if(!req.session.user)
	{
		res.render('error', {user:req.session.user, message: 'You are not logged in'});
		return;
	}
	res.render('filter',{user:req.session.user, myImage:"background.jpg", myFilteredImage:"/assets/background.jpg"});
});

app.post('/loadImg', function(req, res) {
	
	var resultFileName = randomstring.generate()+req.body.loadImgInput;
		pg.connect(connectionString, (err, client, done) => {
		if(err) {
		  done();
		  console.log(err);
		  return res.status(500).json({success: false, data: err});
		}
		
		console.log('insert into tasks (server_id, username, img, img_res, curr_time) values(1, '+req.session.user+', '+req.body.loadImgInput+', '+resultFileName+',CURRENT_TIMESTAMP ) returning id;');
		var rowId;
		const query = client.query("insert into tasks (server_id, username, img, img_res, curr_time) values(1, '"+req.session.user+"', '"+req.body.loadImgInput+"', '"+resultFileName+"',CURRENT_TIMESTAMP ) returning id;");
				query.on('row', (row) => {
				rowId = row.id;
				console.log(rowId);
				});
				query.on('end', () => {
				  done();
				
				res.redirect(307, 'http://localhost:5000/?img='+req.body.loadImgInput+'&user='+req.session.user+'&filteredImg='+resultFileName);
			});
		
		});
});

app.post('/loadFilteredImg', function(req, res) {
	console.log('redirected here');
	console.log('user:'+req.query.user);
	console.log('image:'+req.query.myImage);
	console.log('filtered image:'+req.query.filteredImg);
	res.render('filter', {user:req.query.user, myImage:req.query.myImage, myFilteredImage:req.query.filteredImg 
});});
		

app.get('/test', function(req, res) 
{
	res.redirect(307, 'http://localhost:5000/');
});

app.get('/login', function(req,res){
	
	res.render('login', {message: "",registerMessage:"", user:req.session.user});
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
			  res.render('login', {user:req.session.user, message: 'Authentication failed', registerMessage:""});
		  }
		});
	});
});

app.post('/register', function(req,res){
	pg.connect(connectionString, (err, client, done) => {
		if(err) {
		  done();
		  console.log(err);
		  return res.status(500).json({success: false, data: err});
		}
		
		var usernameExists = false;
		const query = client.query('select count(username) as quantity from users where username = \'' + req.body.newUser+ '\'');
				query.on('row', (row) => {
					console.log(row.quantity);
					if(row.quantity == 1)
					{
					usernameExists = true;
					console.log(req.body.newUser+' already exists');
					res.render('login', {user:req.session.user, message: '', registerMessage:'User with this login already exists. Please choose another'});
					}
				});
				query.on('end', () => {
				  done();
				  if(usernameExists==false)
				  {
				  		const query2 = client.query('insert into users values (\''+ req.body.newUser + '\', \''+req.body.newPassword +'\', false);');
				query2.on('row', (row) => {
					console.log(req.body.newUser);
					
				});
				query2.on('end', () => {
				  done();
				  req.session.user=req.body.newUser;
				  res.render('main', {user:req.session.user});
				});
				  }
				  else{
					  res.render('main', {user:req.session.user});
				  }
		
			});
		
		});
});

module.exports = app;