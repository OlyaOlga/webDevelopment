
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