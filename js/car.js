/**
 * Car class for both player and enemy cars
 */
class Car {
    constructor(game, x, y, width, height, type = 'player') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        
        // Physics properties
        this.speed = 0;
        this.maxSpeed = type === 'player' ? 300 : random(150, 220);
        this.acceleration = type === 'player' ? 80 : 0;
        this.friction = 0.95;
        this.turnSpeed = 0;
        this.maxTurnSpeed = 150;
        this.turnAcceleration = 300;
        this.turnFriction = 0.9;
        
        // Visual properties
        this.color = type === 'player' ? '#3498db' : ['#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'][random(0, 4)];
        this.wheelAngle = 0;
        this.maxWheelAngle = 30;
        
        // Car images
        this.image = new Image();
        if (type === 'player') {
            this.image.src = 'assets/car.svg';
        } else {
            // Randomly select one of the enemy car images
            const enemyCarNumber = random(1, 3);
            this.image.src = `assets/enemy-car${enemyCarNumber}.svg`;
        }
        
        // For enemy cars
        if (type === 'enemy') {
            this.lane = random(0, this.game.road.lanes - 1);
            this.x = this.game.road.getLaneCenter(this.lane);
            this.speed = this.maxSpeed;
        }
        
        // Collision properties
        this.collided = false;
    }
    
    update(deltaTime, steeringInput) {
        if (this.type === 'player' && !this.collided) {
            // Update speed based on acceleration
            this.speed += this.acceleration * deltaTime;
            this.speed = Math.min(this.speed, this.maxSpeed);
            
            // Apply steering input
            this.turnSpeed += steeringInput * this.turnAcceleration * deltaTime;
            this.turnSpeed = clamp(this.turnSpeed, -this.maxTurnSpeed, this.maxTurnSpeed);
            
            // Update wheel angle for visual effect
            this.wheelAngle = steeringInput * this.maxWheelAngle;
            
            // Apply turn to position
            this.x += this.turnSpeed * deltaTime;
            
            // Apply friction to turning
            this.turnSpeed *= Math.pow(this.turnFriction, deltaTime * 60);
            
            // Keep car within road boundaries
            const roadWidth = this.game.road.width;
            const margin = this.width / 2;
            this.x = clamp(this.x, margin, roadWidth - margin);
        } else if (this.type === 'enemy') {
            // Enemy cars move down the screen
            this.y += this.speed * deltaTime;
            
            // Remove enemy cars that go off screen
            if (this.y > this.game.height + this.height) {
                this.game.removeEnemyCar(this);
            }
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if (this.collided && this.type === 'player') {
            // Draw crashed car with rotation and damage effect
            ctx.rotate(Math.PI * 0.05); // Slight tilt
            
            // Draw the car image with a grayscale filter
            ctx.filter = 'grayscale(80%) brightness(70%)';
            ctx.drawImage(
                this.image,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
            
            // Add some smoke/debris particles
            ctx.filter = 'none';
            
            ctx.restore();
            return;
        }
        
        // Draw car using the SVG image
        if (this.image.complete) {
            // Rotate wheels for player car
            if (this.type === 'player') {
                ctx.rotate(degToRad(this.wheelAngle * 0.1)); // Slight car body rotation based on steering
            }
            
            // Draw the car image
            ctx.drawImage(
                this.image,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            // Fallback if image isn't loaded
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            
            // Simple car details
            ctx.fillStyle = '#333';
            ctx.fillRect(-this.width * 0.35, -this.height * 0.2, this.width * 0.7, this.height * 0.4);
        }
        
        ctx.restore();
    }
    
    drawWheel(ctx, x, y, width, height, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(degToRad(angle));
        
        // Wheel
        ctx.fillStyle = '#111';
        ctx.fillRect(-width / 2, -height / 2, width, height);
        
        // Wheel details
        ctx.fillStyle = '#555';
        ctx.fillRect(-width * 0.1, -height * 0.5, width * 0.2, height);
        
        ctx.restore();
    }
    
    getBounds() {
        // Make the collision box slightly smaller than the visual car for better gameplay
        const collisionMargin = 5;
        return {
            x: this.x - this.width / 2 + collisionMargin,
            y: this.y - this.height / 2 + collisionMargin,
            width: this.width - collisionMargin * 2,
            height: this.height - collisionMargin * 2
        };
    }
    
    collideWith(otherCar) {
        if (this.collided) return false;
        
        const collision = checkCollision(this.getBounds(), otherCar.getBounds());
        
        if (collision) {
            this.collided = true;
            
            // Create explosion effect
            this.game.createExplosion(this.x, this.y);
            
            return true;
        }
        
        return false;
    }
}
