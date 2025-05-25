/**
 * Main entry point for the game
 */
window.addEventListener('load', function() {
    // Get canvas and set initial size
    const canvas = document.getElementById('gameCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create game instance
    const game = new Game(canvas);
    
    // Prevent scrolling on touch devices
    document.body.addEventListener('touchmove', function(e) {
        if (e.target.id !== 'steering-wheel') {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Create placeholder assets if real ones aren't available
    createPlaceholderAssets();
    
    // Preload assets
    preloadAssets().then(() => {
        console.log('Assets loaded successfully');
    }).catch(error => {
        console.error('Error loading assets:', error);
    });
    
    // Add UI controls for mobile
    if (isMobileDevice()) {
        addMobileControls();
    }
});

// Check if device is mobile
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

// Add mobile-specific controls
function addMobileControls() {
    const gameContainer = document.getElementById('game-container');
    
    // Add accelerator and brake pedals for mobile
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'mobile-controls';
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.bottom = '10px';
    controlsContainer.style.left = '10px';
    controlsContainer.style.right = '10px';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'space-between';
    controlsContainer.style.pointerEvents = 'none';
    
    // Brake pedal
    const brakePedal = document.createElement('img');
    brakePedal.src = 'assets/ui/brake-pedal.svg';
    brakePedal.id = 'brake-pedal';
    brakePedal.style.width = '80px';
    brakePedal.style.height = '120px';
    brakePedal.style.pointerEvents = 'auto';
    
    // Accelerator pedal
    const acceleratorPedal = document.createElement('img');
    acceleratorPedal.src = 'assets/ui/accelerator-pedal.svg';
    acceleratorPedal.id = 'accelerator-pedal';
    acceleratorPedal.style.width = '80px';
    acceleratorPedal.style.height = '120px';
    acceleratorPedal.style.pointerEvents = 'auto';
    
    controlsContainer.appendChild(brakePedal);
    controlsContainer.appendChild(acceleratorPedal);
    gameContainer.appendChild(controlsContainer);
    
    // Add touch event listeners
    brakePedal.addEventListener('touchstart', function() {
        // Brake functionality
        if (window.game) {
            window.game.brake = true;
        }
        this.style.transform = 'scale(0.9)';
    });
    
    brakePedal.addEventListener('touchend', function() {
        // Release brake
        if (window.game) {
            window.game.brake = false;
        }
        this.style.transform = 'scale(1)';
    });
    
    acceleratorPedal.addEventListener('touchstart', function() {
        // Accelerate functionality
        if (window.game) {
            window.game.accelerate = true;
        }
        this.style.transform = 'scale(0.9)';
    });
    
    acceleratorPedal.addEventListener('touchend', function() {
        // Release accelerator
        if (window.game) {
            window.game.accelerate = false;
        }
        this.style.transform = 'scale(1)';
    });
}

// Create placeholder assets if real ones aren't available
function createPlaceholderAssets() {
    // Create placeholder steering wheel if not found
    const steeringWheel = document.getElementById('steering-wheel');
    if (!steeringWheel.complete || steeringWheel.naturalHeight === 0) {
        createPlaceholderSteeringWheel();
    }
    
    // Create placeholder sounds if not found
    createPlaceholderSounds();
}

// Create a placeholder steering wheel using canvas
function createPlaceholderSteeringWheel() {
    const steeringWheel = document.getElementById('steering-wheel');
    const canvas = document.createElement('canvas');
    const size = 150;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Draw steering wheel
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw inner circle
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw spokes
    ctx.fillStyle = '#777';
    for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.translate(size/2, size/2);
        ctx.rotate(i * Math.PI / 1.5);
        ctx.fillRect(-5, -size/2 + 10, 10, size - 20);
        ctx.restore();
    }
    
    // Set as source for steering wheel
    steeringWheel.src = canvas.toDataURL();
}

// Create placeholder sounds
function createPlaceholderSounds() {
    const sounds = [
        { id: 'engine-sound', src: 'assets/sounds/engine.mp3' },
        { id: 'crash-sound', src: 'assets/sounds/crash.mp3' },
        { id: 'horn-sound', src: 'assets/sounds/horn.mp3' },
        { id: 'background-music', src: 'assets/sounds/background.mp3' }
    ];
    
    sounds.forEach(sound => {
        const audioElement = document.getElementById(sound.id);
        
        // Create a simple oscillator-based sound if the audio file is missing
        audioElement.onerror = function() {
            console.log(`Creating placeholder for ${sound.id}`);
            
            // Override play method with Web Audio API
            const originalPlay = audioElement.play;
            audioElement.play = function() {
                try {
                    return originalPlay.apply(this);
                } catch (e) {
                    console.log(`Using placeholder sound for ${sound.id}`);
                    // Do nothing - placeholder sound
                    return Promise.resolve();
                }
            };
        };
    });
}

// Preload assets
async function preloadAssets() {
    // Create assets directory if it doesn't exist
    try {
        // This would normally be done server-side, but for this example
        // we'll assume the directory exists or will be created manually
        console.log('Checking for assets directory...');
    } catch (error) {
        console.error('Error checking assets directory:', error);
    }
}
