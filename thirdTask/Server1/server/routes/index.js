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
	if(req.session.admin==true)
	{
		res.send("admin is here");
	}
	else
	{	
		var queryQuantity=0;
		pg.connect(connectionString, (err, client, done) => {
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({success: false, data: err});
			}
			const query = client.query("select count (todayUsersFilters) q from(select * from tasks where curr_time > CURRENT_DATE and username='"+req.session.user+"') as todayUsersFilters;");
			query.on('row', (row) => {
				queryQuantity = row.q;
				console.log("/loadFilteredImg  QUANTITY OF QUERIES: "+queryQuantity );
			});
			query.on('end', () => {
			  done();
			  if(queryQuantity>5)
			  {
			  res.render('error', {user:req.session.user, message: 'Quantity of tasks for today for you is over'});}
		  else{
			  res.render('filter',{user:req.session.user, myImage:"background.jpg", myFilteredImage:"/filtered/background.jpg"});
		  }
			});
		});
		//res.render('filter',{user:req.session.user, myImage:"background.jpg", myFilteredImage:"/filtered/background.jpg"});
		
	}
});


function updateTaskState(rowId)
{
	pg.connect(connectionString, (err, client, done) => {
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({success: false, data: err});
			}
			const query = client.query("update  tasks set task_state='done' where id="+rowId+";");
			query.on('row', (row) => {
				
			});
			query.on('end', () => {
			  done();
			  return;
			});
		});
} 


app.post('/loadImg', function(req, res) {
	
	
	var queryQuantity=0;
		pg.connect(connectionString, (err, client, done) => {
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({success: false, data: err});
			}
			const query = client.query("select count (todayUsersFilters) q from(select * from tasks where curr_time > CURRENT_DATE and username='"+req.session.user+"') as todayUsersFilters;");
			query.on('row', (row) => {
				queryQuantity = row.q;
				console.log("/loadFilteredImg  QUANTITY OF QUERIES: "+queryQuantity );
			});
			query.on('end', () => {
			  done();
			  if(queryQuantity>5)
			  {
			  res.render('error', {user:req.session.user, message: 'Quantity of tasks for today for you is over'});}
		  else{
			  ////////
			  var resultFileName = randomstring.generate()+req.body.loadImgInput;
		pg.connect(connectionString, (err, client, done) => {
		if(err) {
		  done();
		  console.log(err);
		  return res.status(500).json({success: false, data: err});
		}
		
		
		var serverNum;
		const query2 = client.query("select server_id, count(server_id) as quantity from tasks where task_state='doing' group by server_id order by quantity limit 1;");
			query2.on('row', (row) => { 
					serverNum=row.server_id;
			});
			query2.on('end', () => 
			{	 
				done();						
				var limit = 5;
				console.log("SERVER NUM:"+serverNum);
				pg.connect(connectionString, (err, client, done) => 
				{
					if(err) {
					done();
					console.log(err);
					return res.status(500).json({success: false, data: err});
				}
				var queryResult;
				const query11 = client.query("select count(q.task_state) as quantity from (select task_state from tasks where server_id="+serverNum +" and task_state='doing') as q;");
				query11.on('row', (row) =>
				{
				queryResult = row.quantity;
				console.log("QUERY RES: "+queryResult);				
				});
			query11.on('end', () => 
			{
			  done();
			  if(queryResult<limit)
			  {
				console.log("SERVER CAN BE USED");
				 var rowId;
				const query = client.query("insert into tasks (server_id, username, img, img_res, curr_time, task_state) values("+serverNum+", '"+req.session.user+"', '"+req.body.loadImgInput+"', '"+resultFileName+"',CURRENT_TIMESTAMP, 'doing' ) returning id;");
				query.on('row', (row) => {
				rowId = row.id;
				console.log("ROW ID:"+rowId);
				});
				query.on('end', () => {
				  done();
				if(serverNum==1)
				{
					console.log("REDIRECTED TO FIRST SERVER");
					res.redirect(307, 'http://localhost:5000/?img='+req.body.loadImgInput+'&user='+req.session.user+'&filteredImg='+resultFileName+'&taskId='+rowId);
				}
				else
				{
					console.log("REDIRECTED TO SECOND SERVER");
					res.redirect(307, 'http://localhost:8088/?img='+req.body.loadImgInput+'&user='+req.session.user+'&filteredImg='+resultFileName+'&taskId='+rowId);
				}
			});
			  }
			  else
			  {
				    res.render('error', {user:req.session.user, message: 'Now servers are busy. Pleasle, try later'});
			  }  
			});
		});	
			});		
});
 

	////////
			 // res.render('filter',{user:req.session.user, myImage:"background.jpg", myFilteredImage:"/filtered/background.jpg"});
		  }
			});
		});	
	
});

app.post('/loadFilteredImg', function(req, res) {
	
		
			  ////////
	pg.connect(connectionString, (err, client, done) => {	
	var username;
	var rowId = req.query.taskId;
		pg.connect(connectionString, (err, client, done) => {
		if(err) {
		  done();
		  console.log(err);
		  return res.status(500).json({success: false, data: err});
		}
		const query1 = client.query('select username from tasks where id= ($1)', [rowId]);
		query1.on('row', (row) => {
			username = row.username;
		});
		query1.on('end', () => {
		 done();
		req.session.user = username;		
		updateTaskState(rowId);
		res.render('filter', {user:req.query.user, myImage:req.query.myImage, myFilteredImage:req.query.filteredImg});});
		});
	});
	////////
			 // res.render('filter',{user:req.session.user, myImage:"background.jpg", myFilteredImage:"/filtered/background.jpg"});
	

	
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
				  else
				  {
					  res.render('main', {user:req.session.user});
				  }
		
			});
		
		});
});

app.get('/myFilteredImages', function(req,res){
	if(!req.session.user)
	{
		res.render('error', {user:req.session.user, message: 'You are not logged in'});
		return;
	}
	const rows = [];
	if(req.session.admin==true)
	{		
		var queryQuantity=0;
		pg.connect(connectionString, (err, client, done) => {
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({success: false, data: err});
			}
			const query = client.query("select count (todayUsersFilters) q from(select * from tasks where curr_time > CURRENT_DATE and username='"+req.session.user+"') as todayUsersFilters;");
			query.on('row', (row) => {
				queryQuantity = row.q;
			});
			query.on('end', () => {
			  done();
			  if(queryQuantity>5)
			  res.render('error', {user:req.session.user, message: 'Quantity of tasks for today for you is over'});
		  else{
			  pg.connect(connectionString, (err, client, done) => {
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({success: false, data: err});
			}
			const query = client.query("select * from tasks where task_state='doing' order by curr_time desc;");
			query.on('row', (row) => {
				rows.push(row);
			});
			query.on('end', () => {
			  done();
			  res.render('adminsPage', {user:req.session.user, tasks:rows});
			});
		})
		  }
			});
		});
	}
	else
	{
	pg.connect(connectionString, (err, client, done) => {
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({success: false, data: err});
			}
			const query = client.query("select * from tasks where username='" +req.session.user+"' order by curr_time desc;");
			query.on('row', (row) => {
				rows.push(row);
			});
			query.on('end', () => {
			  done();
			  res.render('usersPage', {user:req.session.user, tasks:rows});
			});
		});
	}
});
module.exports = app;