
class Ball {

    constructor(x, y, r, ang, speed, paddleLeft, paddleRight){
        // Assign x/y position and save it for later use
        this.x = x;
        this.orgX = x;
        this.y = y;
        this.orgY = y;
        this.r = r;
        this.speed = speed;
        // Calculate xspeed/yspeed based on its angle and speed
        this.xspeed = cos(ang) * speed;
        this.yspeed = sin(ang) * speed;
        this.paddleLeft = paddleLeft;
        this.paddleRight = paddleRight;
    }

    // Call to respawn ball at its origin with a random angle
    respawn(){
        this.x = this.orgX;
        this.y = this.orgY;
        let ang = random(-PI / 4, PI / 4) + (random(1) > 0.5 ? 0 : PI);
        this.xspeed = cos(ang) * this.speed;
        this.yspeed = sin(ang) * this.speed;
    }

    // Check collision with a paddle
    collisionPaddle(p){
        // 2D collision test
        if( this.x + this.r > p.x &&
            this.x - this.r < p.x + p.w &&
            this.y + this.r > p.y &&
            this.y - this.r < p.y + p.h
        )
            return true;
        return false;
    }

    // Check collision with edges
    collisionEdge(){
        if(this.y - this.r < 0 || this.y + this.r > height)
            return true;
        return false;
    }

    // Move ball in a given direction
    move(dir = 1){
        this.x += this.xspeed * dir;
        this.y += this.yspeed * dir;
    }

    // Updates the ball's position and checks collision
    update(){
        // Move ball in its direction
        this.move();
        // Check collision with edges
        if(this.collisionEdge()){
            // Move ball back 1 frame
            this.move(-1);
            // It can only collide with floor & ceiling, therefore it's sufficient to invert yspeed
            this.yspeed *= -1;
        }
        // Check collision with paddles
        if(this.collisionPaddle(this.paddleLeft) || this.collisionPaddle(this.paddleRight)){
            // Determine which paddle was hit
            let isLeft = this.collisionPaddle(this.paddleLeft) ? true : false;
            // Assign paddle to p and use 3/-3 to determine which section the ball hit
            let p = isLeft ? this.paddleLeft : this.paddleRight;
            let s = isLeft ? -3 : 3;
            // Move ball to infront of the paddle to help it not get stuck
            this.x = isLeft ? this.paddleLeft.x + this.paddleLeft.w + this.r + 2 : this.paddleRight.x - this.r + 2;
            // Calculate which section was hit
            let sec = floor(map(this.y, p.y, p.y + p.h, s, s * -1));
            // Lookup what angle should be applied for a given section
            for(let bounce of paddleBounce){
                if(bounce.s == sec){
                    // Section found, apply angle
                    this.xspeed = cos((radians(bounce.ang) + (isLeft ? 0 : PI))) * this.speed;
                    this.yspeed = sin((radians(bounce.ang) + (isLeft ? 0 : PI))) * this.speed;
                    break;
                }
            }
        }
        // If it's outside on the left/right side it means someone scored. Award points accordingly
        if(this.x < 0 || this.x > width){
            awardPoint(this.x < 0 ? "left" : "right");
            // Then respawn the ball
            this.respawn();
        }
    }

    // Call to draw ball on the canvas
    show(){
        fill(255);
        circle(this.x, this.y, this.r);
    }
}


class Paddle {

    constructor(x, y, w, h, speed, color){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.speed = speed;
        this.color = color;
    }

    // Call to move the paddle in a given direction (down/up)
    move(dir){
        this.y += this.speed * dir;
        this.y = constrain(this.y, 0, height - this.h);
    }

    // Call to draw the paddle on the canvas
    show(){
        fill(this.color);
        rect(this.x, this.y, this.w, this.h);
    }

    // Aligns paddle with ball to simulate an AI (obv. unbeatable at this point)
    ai(ball){
        if(ball.y < this.y)
            this.move(-1);
        else if(ball.y > this.y + this.h)
            this.move(1);
    }
}
