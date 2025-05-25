/**
 * Input handling for both keyboard and touch controls
 */
class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {
            left: false,
            right: false
        };
        
        // Steering wheel properties
        this.steeringWheel = document.getElementById('steering-wheel');
        this.steeringAngle = 0;
        this.maxSteeringAngle = 60; // Maximum rotation in degrees
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isTouching = false;
        
        // Set up keyboard controls
        window.addEventListener('keydown', e => this.handleKeyDown(e));
        window.addEventListener('keyup', e => this.handleKeyUp(e));
        
        // Set up touch controls for steering wheel
        this.steeringWheel.addEventListener('touchstart', e => this.handleTouchStart(e));
        window.addEventListener('touchmove', e => this.handleTouchMove(e));
        window.addEventListener('touchend', e => this.handleTouchEnd(e));
        
        // Mouse controls for desktop testing of steering wheel
        this.steeringWheel.addEventListener('mousedown', e => this.handleMouseDown(e));
        window.addEventListener('mousemove', e => this.handleMouseMove(e));
        window.addEventListener('mouseup', e => this.handleMouseUp(e));
        
        // Button controls
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.game.restart());
        document.getElementById('restart-game-btn').addEventListener('click', () => this.game.restart());
        document.getElementById('start-game-btn').addEventListener('click', () => this.game.start());
        document.getElementById('sound-btn').addEventListener('click', () => this.toggleSound());
        
        // Horn control (spacebar or button)
        window.addEventListener('keydown', e => {
            if (e.code === 'Space' && !this.game.gameOver) {
                this.game.playHorn();
            }
        });
        
        // Horn button (if it exists)
        const hornBtn = document.getElementById('horn-btn');
        if (hornBtn) {
            hornBtn.addEventListener('click', () => {
                if (!this.game.gameOver) {
                    this.game.playHorn();
                }
            });
            
            // For mobile, add touch events
            hornBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!this.game.gameOver) {
                    this.game.playHorn();
                }
            });
        }
    }
    
    handleKeyDown(e) {
        if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && this.game.gameActive) {
            this.keys.left = true;
        }
        if ((e.code === 'ArrowRight' || e.code === 'KeyD') && this.game.gameActive) {
            this.keys.right = true;
        }
        if (e.code === 'Escape') {
            this.togglePause();
        }
    }
    
    handleKeyUp(e) {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            this.keys.left = false;
        }
        if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            this.keys.right = false;
        }
    }
    
    handleTouchStart(e) {
        if (!this.game.gameActive) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.isTouching = true;
    }
    
    handleTouchMove(e) {
        if (!this.isTouching || !this.game.gameActive) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        
        // Calculate steering angle based on touch movement
        this.steeringAngle = clamp(deltaX / 2, -this.maxSteeringAngle, this.maxSteeringAngle);
        this.updateSteeringWheelRotation();
    }
    
    handleTouchEnd(e) {
        this.isTouching = false;
        
        // Reset steering wheel gradually
        this.resetSteeringWheel();
    }
    
    handleMouseDown(e) {
        if (!this.game.gameActive) return;
        
        e.preventDefault();
        this.touchStartX = e.clientX;
        this.touchStartY = e.clientY;
        this.isTouching = true;
    }
    
    handleMouseMove(e) {
        if (!this.isTouching || !this.game.gameActive) return;
        
        e.preventDefault();
        const deltaX = e.clientX - this.touchStartX;
        
        // Calculate steering angle based on mouse movement
        this.steeringAngle = clamp(deltaX / 2, -this.maxSteeringAngle, this.maxSteeringAngle);
        this.updateSteeringWheelRotation();
    }
    
    handleMouseUp(e) {
        this.isTouching = false;
        
        // Reset steering wheel gradually
        this.resetSteeringWheel();
    }
    
    updateSteeringWheelRotation() {
        this.steeringWheel.style.transform = `rotate(${this.steeringAngle}deg)`;
    }
    
    resetSteeringWheel() {
        // Animate steering wheel back to center
        const resetInterval = setInterval(() => {
            if (Math.abs(this.steeringAngle) < 2) {
                this.steeringAngle = 0;
                this.updateSteeringWheelRotation();
                clearInterval(resetInterval);
            } else {
                this.steeringAngle *= 0.8;
                this.updateSteeringWheelRotation();
            }
        }, 50);
    }
    
    getSteeringInput() {
        // Combine keyboard and touch/mouse input
        let steeringInput = 0;
        
        if (this.keys.left) steeringInput -= 1;
        if (this.keys.right) steeringInput += 1;
        
        // Add touch/mouse steering input
        if (this.isTouching) {
            steeringInput = this.steeringAngle / this.maxSteeringAngle;
        }
        
        return clamp(steeringInput, -1, 1);
    }
    
    togglePause() {
        if (this.game.gameOver) return;
        
        if (this.game.gameActive) {
            this.game.pause();
            document.getElementById('pause-btn').textContent = '▶️';
            document.getElementById('restart-btn').style.display = 'block';
        } else {
            this.game.resume();
            document.getElementById('pause-btn').textContent = '⏸️';
            document.getElementById('restart-btn').style.display = 'none';
        }
    }
    
    toggleSound() {
        const soundBtn = document.getElementById('sound-btn');
        if (this.game.soundEnabled) {
            this.game.soundEnabled = false;
            soundBtn.textContent = '🔇';
            this.game.muteAllSounds();
        } else {
            this.game.soundEnabled = true;
            soundBtn.textContent = '🔊';
            this.game.unmuteAllSounds();
        }
    }
}
