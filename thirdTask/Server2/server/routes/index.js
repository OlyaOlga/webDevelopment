const express = require('express');
var app = express();
var session = session = require('express-session');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const exec = require("child_process").exec
var connectionString = "postgres://postgres:ll1745ll@127.0.0.1:5432/HeavyTasks";
var pgClient = new pg.Client(connectionString);

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));


app.set('view engine', 'ejs');

app.post('/', function(req, res) //localhost:4000/      <-------
{
	console.log('imgName: '+req.query.img);
	exec('E:/Studying/web_studying/ImageFiltering/x64/Debug/ImageFiltering.exe '+req.query.img+ ' '+req.query.filteredImg, function callback(error, stdout, stderr){
		var filtered = '/filtered/'+req.query.filteredImg;
		
	res.redirect(307,'http://localhost:4000/loadFilteredImg?user='+req.query.user+'&myImage='+req.query.img+'&filteredImg='+filtered)});
		/*
		function callback(error, stdout, stderr){
			res.render('filter',{user:req.session.user, myImage:req.query.loadImgInput, myFilteredImage:'/assets/filtered/result_'+req.query.loadImgInput });
		}
		*/
});


module.exports = app;