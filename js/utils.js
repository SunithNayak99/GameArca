/**
 * Utility functions for the game
 */

// Random number generator between min and max (inclusive)
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if two rectangles are colliding
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Clamp a value between min and max
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Lerp (linear interpolation) between two values
function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

// Convert degrees to radians
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Preload an image
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Preload audio
function loadAudio(src) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.oncanplaythrough = () => resolve(audio);
        audio.onerror = reject;
        audio.src = src;
    });
}

// Create a simple particle system
class ParticleSystem {
    constructor(x, y, count, color, speed, lifetime, size) {
        this.particles = [];
        this.active = true;
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                size: Math.random() * size + 1,
                color: color,
                lifetime: Math.random() * lifetime + lifetime / 2,
                age: 0
            });
        }
    }
    
    update(deltaTime) {
        let activeParticles = false;
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.age += deltaTime;
            
            if (p.age < p.lifetime) {
                activeParticles = true;
                p.x += p.vx * deltaTime;
                p.y += p.vy * deltaTime;
                p.size *= 0.99;
            }
        }
        
        this.active = activeParticles;
    }
    
    draw(ctx) {
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            if (p.age < p.lifetime) {
                const alpha = 1 - (p.age / p.lifetime);
                ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}
