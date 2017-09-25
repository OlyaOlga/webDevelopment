
function rand_photo(id)
{	
	var tom = "tom_";
	var jpg=".jpg";
	var num = Math.floor(Math.random()*7) +1;
	var rnd_photo = tom+num+jpg;
	document.getElementById(id).src = rnd_photo;
}

function change_size(id)
{
	document.getElementById(id).style.height = "550px";
	document.getElementById(id).style.width = "400px";
}

function return_orig_size(id)
{
	document.getElementById(id).style.height = "515px";
	document.getElementById(id).style.width = "386px";
}

function start_game()
{
	var game_elems = document.getElementsByClassName("game");
	for(var i=0; i<game_elems.length; ++i)
	{
		game_elems[i].style.display = "inline";
	}
	document.getElementById("stop_training").style.display = "inline";
}

function mouse_running()
{
	var maxWidth = window.innerWidth;
	var maxHeight = window.innerHeight;
	var diff = 100;
	maxWidth -=diff;
	maxHeight-=diff;
	var curr_x = Math.floor(Math.random()*maxWidth) + diff/2;
	var curr_y = Math.floor(Math.random()*maxHeight) + diff/2;
	document.getElementById("mouse").style.top = curr_y+"px";
	document.getElementById("mouse").style.left = curr_x+"px";

	if(curr_x<200&&curr_y<200)
{
	window.alert("you won!");
}

	
}

function stop_current_training()
{
	var game_elems = document.getElementsByClassName("game");
	for(var i=0; i<game_elems.length; ++i)
	{
		game_elems[i].style.display = "none";
	}
	document.getElementById("stop_training").style.display = "none";
	document.getElementById("mouse").style.top="300px";
	document.getElementById("mouse").style.left="300px";
}