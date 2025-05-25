/**
 * Main game class
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Game state
        this.gameActive = false;
        this.gameOver = false;
        this.score = 0;
        this.distance = 0;
        this.speed = 0;
        this.maxSpeed = 300;
        this.acceleration = 20;
        this.lastTime = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1.5; // seconds
        this.difficultyTimer = 0;
        this.difficultyInterval = 10; // seconds
        
        // Control states
        this.brake = false;
        this.accelerate = false;
        
        // Game objects
        this.road = new Road(this);
        this.player = new Car(this, this.width / 2, this.height * 0.8, 50, 100, 'player');
        this.enemyCars = [];
        this.particles = [];
        
        // Input handler
        this.input = new InputHandler(this);
        
        // Audio
        this.engineSound = document.getElementById('engine-sound');
        this.crashSound = document.getElementById('crash-sound');
        this.hornSound = document.getElementById('horn-sound');
        this.backgroundMusic = document.getElementById('background-music');
        this.soundEnabled = true;
        
        // UI elements
        this.scoreElement = document.getElementById('score');
        this.speedElement = document.getElementById('speed-value');
        this.speedIndicator = document.getElementById('speed-indicator');
        this.finalScoreElement = document.getElementById('final-score');
        this.gameOverScreen = document.getElementById('game-over');
        this.startScreen = document.getElementById('start-screen');
        
        // Make game instance globally accessible for mobile controls
        window.game = this;
        
        // Initialize game
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    start() {
        this.gameActive = true;
        this.gameOver = false;
        this.score = 0;
        this.distance = 0;
        this.speed = 0;
        this.maxSpeed = 300;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1.5;
        this.difficultyTimer = 0;
        
        // Reset player
        this.player = new Car(this, this.width / 2, this.height * 0.8, 50, 100, 'player');
        this.enemyCars = [];
        this.particles = [];
        
        // Hide start screen
        this.startScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        
        // Start sounds
        if (this.soundEnabled) {
            this.engineSound.currentTime = 0;
            this.engineSound.play();
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play();
        }
        
        // Start game loop
        requestAnimationFrame(timestamp => this.gameLoop(timestamp));
    }
    
    restart() {
        this.gameOverScreen.style.display = 'none';
        this.start();
    }
    
    pause() {
        this.gameActive = false;
        
        // Pause sounds
        this.engineSound.pause();
        this.backgroundMusic.pause();
    }
    
    resume() {
        if (!this.gameOver) {
            this.gameActive = true;
            
            // Resume sounds
            if (this.soundEnabled) {
                this.engineSound.play();
                this.backgroundMusic.play();
            }
            
            // Continue game loop
            requestAnimationFrame(timestamp => this.gameLoop(timestamp));
        }
    }
    
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        // Update and draw game
        this.update(deltaTime);
        this.draw();
        
        // Continue game loop if game is active
        if (this.gameActive) {
            requestAnimationFrame(timestamp => this.gameLoop(timestamp));
        }
    }
    
    update(deltaTime) {
        if (!this.gameActive) return;
        
        // Cap delta time to prevent large jumps
        const cappedDeltaTime = Math.min(deltaTime, 0.1);
        
        // Update player speed
        if (!this.player.collided) {
            // Handle brake and accelerate from mobile controls
            if (this.brake) {
                this.speed *= 0.95;
            } else if (this.accelerate) {
                this.speed += this.acceleration * 1.5 * cappedDeltaTime;
            } else {
                this.speed += this.acceleration * cappedDeltaTime;
            }
            this.speed = Math.min(this.speed, this.maxSpeed);
        } else {
            this.speed *= 0.95;
        }
        
        // Update road
        this.road.update(cappedDeltaTime, this.speed);
        
        // Update player
        const steeringInput = this.input.getSteeringInput();
        this.player.update(cappedDeltaTime, steeringInput);
        
        // Update enemy cars
        this.enemyCars.forEach(car => car.update(cappedDeltaTime));
        
        // Check collisions
        this.checkCollisions();
        
        // Spawn enemy cars
        this.enemySpawnTimer += cappedDeltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemyCar();
            this.enemySpawnTimer = 0;
        }
        
        // Increase difficulty over time
        this.difficultyTimer += cappedDeltaTime;
        if (this.difficultyTimer >= this.difficultyInterval) {
            this.increaseDifficulty();
            this.difficultyTimer = 0;
        }
        
        // Update particles
        this.particles = this.particles.filter(p => p.active);
        this.particles.forEach(p => p.update(cappedDeltaTime));
        
        // Update score and distance
        if (!this.player.collided) {
            this.distance += this.speed * cappedDeltaTime;
            this.score = Math.floor(this.distance / 10);
            
            // Update UI
            this.scoreElement.textContent = `Score: ${formatNumber(this.score)}`;
            this.speedElement.textContent = `${Math.floor(this.speed)} mph`;
            this.speedIndicator.style.width = `${(this.speed / this.maxSpeed) * 100}%`;
        }
        
        // Update engine sound pitch based on speed
        if (this.soundEnabled) {
            this.engineSound.playbackRate = 0.5 + (this.speed / this.maxSpeed) * 1.5;
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw road
        this.road.draw(this.ctx);
        
        // Draw enemy cars
        this.enemyCars.forEach(car => car.draw(this.ctx));
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw particles
        this.particles.forEach(p => p.draw(this.ctx));
    }
    
    spawnEnemyCar() {
        const carWidth = 50;
        const carHeight = 100;
        
        // Choose a random car type
        const carTypes = ['enemy-car1', 'enemy-car2', 'enemy-car3', 'sports-car', 'suv', 'truck', 'police-car', 'taxi'];
        const randomType = carTypes[Math.floor(Math.random() * carTypes.length)];
        
        // Create the enemy car
        const enemyCar = new Car(this, 0, -carHeight, carWidth, carHeight, 'enemy');
        
        // Set the specific car image
        enemyCar.image.src = `assets/${randomType}.svg`;
        
        // Adjust size for truck (larger)
        if (randomType === 'truck') {
            enemyCar.width = 60;
            enemyCar.height = 120;
        }
        
        this.enemyCars.push(enemyCar);
    }
    
    removeEnemyCar(car) {
        const index = this.enemyCars.indexOf(car);
        if (index !== -1) {
            this.enemyCars.splice(index, 1);
        }
    }
    
    checkCollisions() {
        // Check player collision with enemy cars
        for (const enemyCar of this.enemyCars) {
            if (this.player.collideWith(enemyCar)) {
                this.gameOver = true;
                this.gameActive = false;
                
                // Play crash sound
                if (this.soundEnabled) {
                    this.crashSound.currentTime = 0;
                    this.crashSound.play();
                    this.engineSound.pause();
                    this.backgroundMusic.pause();
                }
                
                // Show game over screen
                this.finalScoreElement.textContent = `Score: ${formatNumber(this.score)}`;
                this.gameOverScreen.style.display = 'block';
                
                break;
            }
        }
    }
    
    createExplosion(x, y) {
        // Create particle explosion
        const explosion = new ParticleSystem(
            x, y, 50, '#ff5500', 200, 1, 5
        );
        this.particles.push(explosion);
        
        // Create explosion image
        const explosionImg = new Image();
        explosionImg.src = 'assets/explosion.svg';
        
        // Add to particles array with custom draw method
        this.particles.push({
            x: x,
            y: y,
            size: 100,
            age: 0,
            lifetime: 1,
            active: true,
            update: function(deltaTime) {
                this.age += deltaTime;
                this.size += deltaTime * 100; // Grow explosion
                this.active = this.age < this.lifetime;
            },
            draw: function(ctx) {
                if (explosionImg.complete && this.active) {
                    const alpha = 1 - (this.age / this.lifetime);
                    ctx.globalAlpha = alpha;
                    ctx.drawImage(
                        explosionImg,
                        this.x - this.size/2,
                        this.y - this.size/2,
                        this.size,
                        this.size
                    );
                    ctx.globalAlpha = 1;
                }
            }
        });
    }
    
    increaseDifficulty() {
        // Increase max speed
        this.maxSpeed += 10;
        
        // Decrease enemy spawn interval (more enemies)
        this.enemySpawnInterval = Math.max(0.5, this.enemySpawnInterval * 0.95);
    }
    
    resize() {
        // Adjust canvas size to window
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Update road and player positions
        this.road.width = this.width;
        this.road.height = this.height;
        this.road.laneWidth = this.width / (this.road.lanes + 1);
        
        // Reset lane lines
        this.road.lines = [];
        this.road.initLines();
        
        // Update player position
        if (this.player) {
            this.player.y = this.height * 0.8;
        }
    }
    
    playHorn() {
        if (this.soundEnabled) {
            this.hornSound.currentTime = 0;
            this.hornSound.play();
        }
    }
    
    muteAllSounds() {
        this.engineSound.pause();
        this.backgroundMusic.pause();
        this.hornSound.pause();
        this.crashSound.pause();
    }
    
    unmuteAllSounds() {
        if (this.gameActive && !this.gameOver) {
            this.engineSound.play();
            this.backgroundMusic.play();
        }
    }
}
