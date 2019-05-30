// Global variables
let ball, left, right;
let score = {left: 0, right: 0};
let touchAreas;
let paused = false;

// Lookup table for keycodes
const keys = [
    {code: 87, p: "left", dir: -1},  // w
    {code: 83, p: "left", dir: 1},   // s
    {code: 79, p: "right", dir: -1}, // o
    {code: 76, p: "right", dir: 1}   // l
];

// Lookup table for angle calculation
const paddleBounce = [
    { s: -3, ang: -45 },
    { s: -2, ang: -30 },
    { s: -1, ang: -15 },
    { s:  0, ang:   0 },
    { s:  1, ang:  15 },
    { s:  2, ang:  30 },
    { s:  3, ang:  45 },
];

// Is run once by P5js
function setup(){
    // Calculate size of canvas
    let maxSize = getMaxSize();
    // Create the canvas with said size and assign to correct parent element
    let canvas = createCanvas(maxSize.w, maxSize.h);
    canvas.parent("#container");
    // Append element with information to same parent element
    document.getElementById("container").appendChild(document.getElementById("textBlock"));

    // Calculate size/speed of ball/paddle
    let pWidth = 10;
    let pHeight = height / 6;
    let pSpeed = height / 80;
    let bSpeed = width / 120;
    let bRadius = constrain(height / 120, 5, 20);

    // Create left & right paddle
    left = new Paddle(pWidth, height / 2 - pHeight / 2, pWidth, pHeight, pSpeed, color(255, 0, 0));
    right = new Paddle(width - pWidth * 2, height / 2 - pHeight / 2, pWidth, pHeight, pSpeed, color(0, 255, 0));
    // Create ball
    ball = new Ball(width / 2, height / 2, bRadius, random(PI / 2), bSpeed, left, right);

    // Set params for text (score and pause text)
    textSize(25);
    textAlign(CENTER, CENTER);

    // Calculate touch areas
    touchAreas = calculateTouchAreas();
}

// Is continuously run by P5js
function draw(){
    // Draw a background
    background("#3d3d3d");

    // Check if screen is being touched
    checkTouches();
    // If game is not paused, update positions
    if(!paused){
        checkKeyPresses();
        ball.update();
    }

    // Uncomment following row to enable AI for right paddle
    // right.ai(ball);

    // Draw paddles & ball
    left.show();
    right.show();
    ball.show();

    // Display score and pause text (if game is paused)
    fill(255);
    text(score.left, 20, 20);
    text(score.right, width - 20, 20);
    if(paused)
        text("Game is paused", width / 2, height - 20);
}

// Awards point to left or right player
function awardPoint(p){
    if(p == "left")
        score.right++;
    else
        score.left++;
}

// Called by DOM when a keypress is registered
function keyPressed(){
    // 32 == "space"
    if(keyCode == 32)
        paused = !paused;
}

// Checks if a key is pressed
function checkKeyPresses(){
    for(let key of keys){
        if(keyIsDown(key.code)){
            // A key representing a paddle has been pressed
            if(key.p == "left")
                left.move(key.dir);
            else
                right.move(key.dir);
        }
    }
}

// Checks if screen is being touched
function checkTouches(){
    if(touches.length > 0){
        // Loop through lookup table
        for(let t of touches){
            for(let a of touchAreas){
                // Check if the touch was within the perimeter of the touch area
                if(t.x > a.x && t.x < a.x + a.w && t.y > a.y && t.y < a.y + a.h){
                    // Take action
                    if(a.paddle == "left" && !paused)
                        left.move(a.dir);
                    else if(a.paddle == "right" && !paused)
                        right.move(a.dir);
                    else {
                        // If it's neither right or left paddle, toggle pause
                        paused = !paused;
                        return;
                    }
                }
            }
        }
    }
}

// Calculates max size of canvas in relation to windowWidth & windowHeight
function getMaxSize(){
    let res = 1.5;
    let buffer = 100;
    if(windowHeight * 1.5 < windowWidth) // Use windowHeight as reference
        return {h: windowHeight - buffer, w: (windowHeight - buffer) * res};
    else // Use windowWidth as reference
        return {h: (windowWidth - buffer) * (1 / res), w: windowWidth - buffer};
}

// Calculates touch areas based on canvas size
function calculateTouchAreas(){
    return [
        { x: 0,                 w: 50,    y: 0,            h: height / 2, paddle: "left",   dir: -1  },
        { x: 0,                 w: 50,    y: height / 2,   h: height / 2, paddle: "left",   dir: 1   },
        { x: width - 50 ,       w: 50,    y: 0,            h: height / 2, paddle: "right",  dir: -1  },
        { x: width - 50 ,       w: 50,    y: height / 2,   h: height / 2, paddle: "right",  dir: 1   },
        { x: width / 2 - 50,    w: 100,   y: height - 40,  h: 40,         paddle: "pause" } // Touch area for pause
    ];
}
