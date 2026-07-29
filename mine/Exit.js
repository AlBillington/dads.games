class Exit {
    constructor(x, y) {
        this.x = x * gameState.gridSize + gameState.gridSize / 2;
        this.y = y * gameState.gridSize + gameState.gridSize / 2;
        this.size = gameState.gridSize;
        this.color = '#ffff00';
        this.pulse = 0;
    }

    update() {
        this.pulse += 0.1;
    }

    draw() {
        fill(this.color);
        noStroke();
        const pulseSize = this.size + sin(this.pulse) * 5;
        ellipse(this.x, this.y, pulseSize);
        
        // Draw exit symbol
        fill(0);
        textSize(gameState.gridSize * 0.5);
        textAlign(CENTER, CENTER);
        text('↓', this.x, this.y);
    }
} 