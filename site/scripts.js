function rand_photo(id)
{	
	var tom = "tom_";
	var jpg=".jpg";
	var num = Math.floor(Math.random()*7) +1;
	var rnd_photo = tom+num+jpg;
	console.log(rnd_photo);
	document.getElementById(id).src = rnd_photo;
}