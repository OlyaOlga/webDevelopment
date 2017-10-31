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
	var mystr='hello';
	res.render('main',{user:req.session.user});//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//myveryownvariable != abstractjavascriptvariableforejsfilewithnoidejs
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
	if(!req.session.admin)
	{
	const rows = [];
			pg.connect(connectionString, (err, client, done) => {
				if(err) {
				  done();
				  console.log(err);
				  return res.status(500).json({success: false, data: err});
				}
				console.log('query start');
				const query = client.query("SELECT * FROM catalogue");
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
	}
	else
	{
		console.log("ADMIN!!!");
		if(req.query.action == "remove" && req.query.id)
		{
			pg.connect(connectionString, (err, client, done) => {
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({success: false, data: err});
			}
			console.log('query start');
			const query = client.query("delete from catalogue where id = " + req.query.id);
			query.on('row', (row) => {});				
			query.on('end', () => 
				{
					done();
					loadAdm(req,res);
				});
			});	
		}		
		else
		{
			if(req.query.action == "change" && req.query.id)
			{
				var temp;
			pg.connect(connectionString, (err, client, done) => {//!!!!!!!!!!!!
			if(err) 
			{
			  done();
			  console.log(err);
			  return res.status(500).json({success: false, data: err});
			}
			console.log('query start');
			const query = client.query("select * from catalogue where id="+req.query.id);
			query.on('row', (row) =>
			{
				temp = row;
			});				
			query.on('end', () => 
			{
				done();
				console.log("ID on admin's page: "+temp.id);
				res.render('change', {user:req.session.user, rowResult:temp});
			});			
			});
			}
			else
			{
				loadAdm(req,res);
			}
		}
	}
});

app.get('/buy',function(req, res){
	console.log(req.session);
	if(!req.session.user)
	{
		console.log("user not authorised");
		res.render('error', {user:req.session.user, message: 'You are not logged in'});
		return;
	}
	if(!req.session.admin)
	{
			console.log("ordinary user");
			if(req.query.action == "remove" )
				{
					pg.connect(connectionString, (err, client, done) => 
					{
					if(err)
					{
					  done();
					  console.log(err);
					  return res.status(500).json({success: false, data: err});
					}
					const rows = [];
					const query = client.query("delete from orders where order_id = " + req.query.book_id);
					query.on('row', (row) => 
					{
					});
					
					query.on('end', () => 
						{									
							done();
							console.log('111');
							loadUserOrders(req,res)
						});
					});
				}
		if(req.query.id)
		{				
				
				pg.connect(connectionString, (err, client, done) => 
				{
					if(err)
					{
					  done();
					  console.log(err);
					  return res.status(500).json({success: false, data: err});
					}
					const rows = [];
					const query = client.query("insert into orders (username, book_num) values  ('"+req.session.user+"', "+req.query.id+");");
					query.on('row', (row) => 
					{
					});
					
					query.on('end', () => 
					{									
						done();
						loadUserOrders(req,res)
					});
				});
				
		}
		else
		{
			if(req.query.book_id)
			{
				console.log("REMOVED: "+ req.query.book_id);
			}
			loadUserOrders(req,res);
		}
	}	
	else
	{
		const rows = [];
			pg.connect(connectionString, (err, client, done) => {
				if(err) {
				  done();
				  console.log(err);
				  return res.status(500).json({success: false, data: err});
				}
				console.log('query start');
				const query = client.query("select order_id, username, name, price from catalogue, orders where book_num=id;");
				query.on('row', (row) => {
					rows.push(row);
					console.log(row);
				});
				query.on('end', () => {
				  done();
				  console.log(rows.length);
				  res.render('all_orders', {user:req.session.user, orders:rows});
				});
			}); 		
	}
});

app.post('/change', function(req, res)
{
	
console.log(req.body.ChangedPrice+"    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
	pg.connect(connectionString, (err, client, done) => {
		if(err) {
		  done();
		  console.log(err);
		  return res.status(500).json({success: false, data: err});
		}
		client.query('update catalogue set  name=\''+ req.body.ChangedName+
					'\', price=\''+req.body.ChangedPrice+'\', description=\''+
					req.body.ChangedDescription+'\', img=\''+req.body.ChangedPhoto+
					'\' where id='+req.body.id);
					loadAdm(req, res);	
});
});
function loadAdm(req,res)
{
	const rows = [];
		pg.connect(connectionString, (err, client, done) => {
			if(err)
			{
			  done();
			  console.log(err);
			  return res.status(500).json({success: false, data: err});
			}
			console.log('query start');
			const query = client.query("SELECT * FROM catalogue");
			query.on('row', (row) => {
				rows.push(row);
				console.log(row);
			});				
			query.on('end', () => {
			  done();
			  console.log(rows.length);
			  res.render('admin', {user:req.session.user, tovar:rows});
			});
		});
}


function loadUserOrders(req,res)
{
	console.log("LOAD ORDERS PAGE");
	pg.connect(connectionString, (err, client, done) => 
				{
					if(err)
					{
					  done();
					  console.log(err);
					  return res.status(500).json({success: false, data: err});
					}
					const rows = [];
					const query = client.query("select order_id, name, description, img, price from catalogue, orders where id = book_num and username='"+req.session.user+"';");
					query.on('row', (row) => 
					{
						rows.push(row);
						req.session.store.push(row);
						//console.log(row);
					});
					
					var sumResult;
					query.on('end', () => 
					{									
						done();
						
						pg.connect(connectionString, (err, client, done) => 
						{	
						console.log("STARTED SUM QUERY");
						if(err)
						{
							done();
							console.log(err);
							return res.status(500).json({success: false, data: err});
						}
							
						console.log("select sum(price) as total_sum from catalogue, orders where username='"+req.session.user+"' and book_num = id;");
						const sumQuery = client.query("select sum(price) as total_sum from catalogue, orders where username='"+req.session.user+"' and book_num = id;")
						sumQuery.on('row', (row) => 
						{
						sumResult=row.total_sum;
						console.log("TOTAL SUM: "+row.total_sum);
						});
						sumQuery.on('end', () => 
						{									
							done();
							res.render('buy',{user:req.session.user, tovar:rows, totalSum:sumResult});
						});
						});
						
						
					});
					});
}


module.exports = app;