var hours, minutes, seconds;
var timerID;

var timeout = Date.now() + 120*60*1000 + 1000;
var beep0 = (function() { new Audio('beep0.mp3').play() });
var beep2 = (function() { new Audio('beep2.mp3').play() });

// start
setTimeout(beep0, 0);
setTimeout(beep0, 1000);
setTimeout(beep0, 2000);
setTimeout(beep0, 3000);
setTimeout(beep0, 3200);

window.onload =  function() {
	hours = document.getElementById('hours');
	minutes = document.getElementById('minutes');
	seconds = document.getElementById('seconds');

	var screen = pickRandomScreen();
	
	document.body.style["background-image"] = 'url(' + screen.image + ')';

	var text_element = document.getElementsByClassName('silent-text')[0];
	if(screen.text_color){
		text_element.style.color = screen.text_color;		
	}
	if(screen.text_background){
		text_element.style.background = screen.text_background;
	}

	timerID = setInterval(timerTick, 1000);
	timerTick();
}

var screens = [
	{
		image: 'img_flight.jpg'
	},
	{
		image: 'img_man.jpg'
	},
	{
		image: 'img_woman.jpg'
	},
	{ 
		image: 'img_fish.jpg',
		text_color: 'white',
		text_background: 'rgb(26, 87, 162)'
	},
	{
		image: 'img_mountains.jpg',
		text_color: 'white',
		text_background: '#415f4f'
	},
	{
		image: 'img_woolf.jpg',
		text_color: 'white',
		text_background: 'rgb(80, 82, 95)'
	}
];
	
function pickRandomScreen(){
	// test: m={};i=100; while(i--){ var r = pickRandomScreen(); if(!m[r]){ m[r] = 0;} m[r]++;}
	function random(arr){
		if(arr.length == 1){
			return arr[0];
		}

		var middle = Math.round(arr.length/2);

		if(Math.random() > 0.5) {
			return random(arr.slice(0, middle));
		} else {
			return random(arr.slice(middle));
		}
	}

	return random(screens);
}

function timerTick(){
	var now = new Date(timeout - Date.now());
  var h = now.getUTCHours();
  var m = now.getUTCMinutes();
  var s = now.getUTCSeconds();
	
	if(now == 2){
		beep2();
	}

	if(now <= 0){
		clearInterval(timerID);
		beep2();
		setTimeout(window.close, 500);
		return;
	}

	if(h < 10){ h = '0' + h; }
	if(m < 10){ m = '0' + m; }
	if(s < 10){ s = '0' + s; }

	hours.innerHTML = h;
	minutes.innerHTML = m;
	seconds.innerHTML = s;
}