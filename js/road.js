/**
 * Road class for rendering and managing the road
 */
class Road {
    constructor(game) {
        this.game = game;
        this.width = game.width;
        this.height = game.height;
        
        // Road properties
        this.lanes = 3;
        this.laneWidth = this.width / (this.lanes + 1);
        this.roadColor = '#333';
        this.lineColor = '#fff';
        this.lineWidth = 10;
        this.lineHeight = 50;
        this.lineGap = 30;
        
        // Line animation
        this.lines = [];
        this.initLines();
        
        // Parallax background
        this.backgroundLayers = [
            { y: 0, speed: 0.1, color: '#87CEEB' }, // Sky
            { y: this.height * 0.3, speed: 0.3, color: '#228B22' }, // Far trees
            { y: this.height * 0.5, speed: 0.5, color: '#006400' }  // Near trees
        ];
        
        // Buildings
        this.buildings = [];
        this.initBuildings();
    }
    
    initLines() {
        const totalLines = Math.ceil(this.height / (this.lineHeight + this.lineGap)) + 1;
        
        for (let i = 0; i < totalLines; i++) {
            for (let lane = 1; lane < this.lanes; lane++) {
                this.lines.push({
                    x: lane * this.laneWidth,
                    y: i * (this.lineHeight + this.lineGap) - (this.lineHeight + this.lineGap)
                });
            }
        }
    }
    
    initBuildings() {
        const buildingCount = 15;
        const buildingColors = ['#555', '#666', '#777', '#888', '#999'];
        
        for (let i = 0; i < buildingCount; i++) {
            const side = i % 2 === 0 ? 'left' : 'right';
            const width = random(50, 100);
            const height = random(100, 300);
            const x = side === 'left' ? -width / 2 : this.width + width / 2;
            const y = random(0, this.height);
            const color = buildingColors[random(0, buildingColors.length - 1)];
            
            this.buildings.push({ x, y, width, height, color, side });
        }
    }
    
    update(deltaTime, playerSpeed) {
        // Update lane lines
        const lineSpeed = playerSpeed;
        
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].y += lineSpeed * deltaTime;
            
            // Reset lines that go off screen
            if (this.lines[i].y > this.height) {
                const laneIndex = Math.floor(i % this.lanes);
                this.lines[i].y = -this.lineHeight;
                this.lines[i].x = (laneIndex + 1) * this.laneWidth;
            }
        }
        
        // Update background layers
        for (let layer of this.backgroundLayers) {
            layer.y += playerSpeed * layer.speed * deltaTime;
            if (layer.y > this.height) {
                layer.y = 0;
            }
        }
        
        // Update buildings
        for (let building of this.buildings) {
            building.y += playerSpeed * 0.7 * deltaTime;
            
            // Reset buildings that go off screen
            if (building.y > this.height + building.height) {
                building.y = -building.height;
                building.height = random(100, 300);
                building.width = random(50, 100);
                building.color = ['#555', '#666', '#777', '#888', '#999'][random(0, 4)];
            }
        }
    }
    
    draw(ctx) {
        // Draw sky
        ctx.fillStyle = this.backgroundLayers[0].color;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw background layers
        for (let i = 1; i < this.backgroundLayers.length; i++) {
            const layer = this.backgroundLayers[i];
            ctx.fillStyle = layer.color;
            ctx.fillRect(0, layer.y, this.width, this.height - layer.y);
            ctx.fillRect(0, layer.y - this.height, this.width, this.height);
        }
        
        // Draw buildings
        for (const building of this.buildings) {
            ctx.fillStyle = building.color;
            ctx.fillRect(
                building.x - building.width / 2,
                building.y - building.height,
                building.width,
                building.height
            );
            
            // Draw windows
            const windowSize = 10;
            const windowGap = 15;
            const windowRows = Math.floor(building.height / windowGap) - 1;
            const windowCols = Math.floor(building.width / windowGap) - 1;
            
            ctx.fillStyle = '#ffff99';
            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    // Only draw some windows (random pattern)
                    if (Math.random() > 0.3) {
                        ctx.fillRect(
                            building.x - building.width / 2 + col * windowGap + windowGap / 2,
                            building.y - building.height + row * windowGap + windowGap / 2,
                            windowSize,
                            windowSize
                        );
                    }
                }
            }
        }
        
        // Draw road
        ctx.fillStyle = this.roadColor;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw lane lines
        ctx.fillStyle = this.lineColor;
        for (const line of this.lines) {
            ctx.fillRect(
                line.x - this.lineWidth / 2,
                line.y,
                this.lineWidth,
                this.lineHeight
            );
        }
        
        // Draw road edges
        ctx.fillStyle = '#f00';
        ctx.fillRect(0, 0, 5, this.height);
        ctx.fillRect(this.width - 5, 0, 5, this.height);
    }
    
    getLaneCenter(laneIndex) {
        return (laneIndex + 0.5) * this.laneWidth;
    }
}
