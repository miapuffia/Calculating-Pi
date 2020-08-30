// get canvas related references
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var WIDTH = canvas.width;
var HEIGHT = canvas.height;

//Set constants
const titleText = "Collisions: ";
var numCollisions = 0;

const lineOffset = 20;

const startButton = $("#startButton");
const resetButton = $("#resetButton");
const whatButton = $("#whatButton");

const slider = $("#slider");

const note = $("#note");
const warning = $("#warning");
const time = $("#time");

const speedInput = $("#speed");
const antiAliasing = $("#antiAliasing");

var speed = parseInt(speedInput[0].value, 10);
var useAntiAliasing = antiAliasing[0].checked;

var runningId;

//Create squares
const shapes = [];

//Square1
shapes.push({
	w: 100,
	h: 100,
	m: 16,
	resetToDefault: function() {
		this.v = -100;
		this.x = (WIDTH - this.w) / 2;
		this.y = HEIGHT - this.h - lineOffset;
		this.displayX = (useAntiAliasing ? this.x : parseInt(this.x, 10));
	},
	draw: function() { drawSquare(this); },
});

//Square2
shapes.push({
	w: 20,
	h: 20,
	m: 1,
	resetToDefault: function() {
		this.v = 0;
		this.x = WIDTH / 4;
		this.y = HEIGHT - this.h - lineOffset;
		this.displayX = (useAntiAliasing ? this.x : parseInt(this.x, 10));
	},
	draw: function() { drawSquare(this); },
});

//Line1
shapes.push({
	x1: lineOffset,
	y1: 0,
	x2: lineOffset,
	resetToDefault: function() {
		this.y2 = HEIGHT;
	},
	draw: function() { drawLine(this); },
});

//Line2
shapes.push({
	x1: 0,
	resetToDefault: function() {
		this.y1 = HEIGHT - lineOffset;
		this.x2 = WIDTH;
		this.y2 = HEIGHT - lineOffset;
	},
	draw: function() { drawLine(this); },
});

//Drag related variables
var draging = false;
var mouseXOffset;
var mouseYOffset;

// listen for events
window.addEventListener('resize', myResize);

startButton.click(function() {
	if(this.innerHTML == "Start") {
		this.innerHTML = "Stop";
		
		slider.prop("disabled", true);
		speedInput.prop("disabled", true);
		
		recalculateObjects();
	} else {
		clearInterval(runningId);
		
		this.innerHTML = "Start";
		
		slider.prop("disabled", false);
		speedInput.prop("disabled", false);
	}
});

resetButton.click(function() {
	clearInterval(runningId);
	
	resetObjects();
	
	numCollisions = 0;
	
	draw();
	
	startButton[0].innerHTML = "Start";
	
	slider.prop("disabled", false);
	speedInput.prop("disabled", false);
});

whatButton.click(function() {
	alert("What is this program:\n\n\nThis program calculates digits of Pi by colliding squares with mass and velocity and counting the number of collisions in the negative direction.\n\nThis may seem arbitrary but it's a graphical representation of a simple mathamatical proof.\n\nThe slider allows you to choose how many digits of Pi you will get.\n\nThe numbers on the squares show their mass.\n\nThe animation speed value controls the delay between graphical updates.\n\nThis doesn't affect the result or visual glitches.");
});

slider.on('input', function() {
	let sliderValue = parseInt(this.value, 10);
	
	shapes[0].m = 16 * Math.pow(100, (sliderValue - 1));
	
	switch(sliderValue) {
		case 3:
			note.show();
			warning.hide();
			
			break;
		case 4:
			time[0].innerText = "30 seconds";
			note.hide();
			warning.show();
			
			break;
		case 5:
			time[0].innerText = "5 minutes";
			note.hide();
			warning.show();
			
			break;
		default:
			note.hide();
			warning.hide();
	}
	
	draw();
});

antiAliasing.on('input', function() {
	useAntiAliasing = this.checked;
	
	draw();
});

speedInput.on('input', function() {
	speed = parseInt(speedInput[0].value, 10);
	
	if(speed < parseInt(speedInput.attr("min"), 10)) {
		speed = parseInt(speedInput.attr("min"), 10);
	} else if(speed > parseInt(speedInput.attr("max"), 10)) {
		speed = parseInt(speedInput.attr("max"), 10);
	}
	
	speedInput[0].value = speed;
});

resetObjects();

draw();

function draw() {
	clear();
	
	shapes.forEach(shape => {
		shape.draw();
	});
	
	drawTitle(titleText);
}

function drawSquare(square) {
	ctx.fillStyle = "black";
	ctx.fillRect(square.displayX, square.y, square.w, square.h);
	
	var font = "15px Arial";
	var padding = 5;
	
	var params = {
		context: ctx,
		text: square.m,
		font: font,
		maxWidth: square.w,
		alignment: "center",
		padding: 5,
		fill: "white",
		x: square.displayX,
		y: square.y + ((square.h - parseInt(font, 10)) / 2) - padding,
	};
	
	drawMultilineText(params);
}

function drawLine(line) {
	ctx.strokeStyle = "black";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(line.x1, line.y1);
	ctx.lineTo(line.x2, line.y2);
	ctx.stroke();
}

function drawTitle(text) {
	var params = {
		context: ctx,
		text: text + numCollisions,
		font: "30px Arial",
		maxWidth: WIDTH,
		alignment: "center",
		padding: 10,
		useBackground: true,
	};
	
	drawMultilineText(params);
}

function resetObjects() {
	shapes.forEach(shape => {
		if(typeof shape.resetToDefault !== "undefined") { shape.resetToDefault(); }
	});
}

function recalculateObjects() {
	//Make sure speed is a valid number
	if(isNaN(speed)) {
		return; //Come back to this
	}
	
	runningId = window.setInterval(function () {
		//Stop running if the square has reached the end of the screen
		if(shapes[0].x + shapes[0].w >= WIDTH) {
			clearInterval(runningId);
			
			startButton[0].innerHTML = "Start";
			
			slider.prop("disabled", false);
			speedInput.prop("disabled", false);
			
			return;
		}
		
		shapes[0].x += (speed / 10000) * shapes[0].v;
		shapes[1].x += (speed / 10000) * shapes[1].v;
		
		shapes[0].displayX = (useAntiAliasing ? shapes[0].x : parseInt(shapes[0].x, 10));
		shapes[1].displayX = (useAntiAliasing ? shapes[1].x : parseInt(shapes[1].x, 10));
		
		if(shapes[0].x <= shapes[1].x + shapes[1].w) {
			let newV0 = (((shapes[0].m - shapes[1].m) * shapes[0].v) + (2 * shapes[1].m * shapes[1].v)) / (shapes[0].m + shapes[1].m);
			let newV1 = ((2 * shapes[0].m * shapes[0].v) + ((shapes[1].m - shapes[0].m) * shapes[1].v)) / (shapes[0].m + shapes[1].m);
			
			shapes[0].v = newV0;
			shapes[1].v = newV1;
			
			if(shapes[0].v <= 0) {
				numCollisions++;
			}
		}
		
		if(shapes[1].x <= lineOffset) {
			shapes[1].v *= -1;
		}
		
		draw();
	}, 0);
}

// clear the canvas
function clear() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function myResize(e) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	WIDTH = canvas.width;
	HEIGHT = canvas.height;
	
	resetObjects();
	
	draw();
}