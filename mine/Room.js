class Room {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.grid = [];
        this.shape = this.generateRandomShape();
        this.generateRoom();
    }

    generateRandomShape() {
        const shapes = ['rectangle', 'circle', 'cross', 'L-shape', 'T-shape', 'irregular'];
        return random(shapes);
    }

    generateRoom() {
        // Initialize grid
        for (let x = 0; x < this.width; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.height; y++) {
                this.grid[x][y] = 'wall'; // Start with walls
            }
        }

        // Generate room shape
        this.generateShape();
        
        // Generate random internal walls
        this.generateInternalWalls();

        // Generate random obstacles
        this.generateObstacles();
    }

    generateShape() {
        const centerX = Math.floor(this.width / 2);
        const centerY = Math.floor(this.height / 2);
        
        switch(this.shape) {
            case 'rectangle':
                this.generateRectangle(centerX, centerY);
                break;
            case 'circle':
                this.generateCircle(centerX, centerY);
                break;
            case 'cross':
                this.generateCross(centerX, centerY);
                break;
            case 'L-shape':
                this.generateLShape(centerX, centerY);
                break;
            case 'T-shape':
                this.generateTShape(centerX, centerY);
                break;
            case 'irregular':
                this.generateIrregular(centerX, centerY);
                break;
        }
    }

    generateRectangle(centerX, centerY) {
        const roomWidth = Math.floor(this.width * 0.8);
        const roomHeight = Math.floor(this.height * 0.8);
        const startX = centerX - roomWidth/2;
        const startY = centerY - roomHeight/2;
        
        for (let x = startX; x < startX + roomWidth; x++) {
            for (let y = startY; y < startY + roomHeight; y++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    this.grid[x][y] = 'floor';
                }
            }
        }
    }

    generateCircle(centerX, centerY) {
        const radius = Math.min(this.width, this.height) * 0.35;
        
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const distance = dist(x, y, centerX, centerY);
                if (distance <= radius) {
                    this.grid[x][y] = 'floor';
                }
            }
        }
    }

    generateCross(centerX, centerY) {
        const armWidth = Math.floor(this.width * 0.2);
        const armLength = Math.floor(this.height * 0.4);
        
        // Horizontal arm
        for (let x = centerX - armLength; x < centerX + armLength; x++) {
            for (let y = centerY - armWidth/2; y < centerY + armWidth/2; y++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    this.grid[x][y] = 'floor';
                }
            }
        }
        
        // Vertical arm
        for (let x = centerX - armWidth/2; x < centerX + armWidth/2; x++) {
            for (let y = centerY - armLength; y < centerY + armLength; y++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    this.grid[x][y] = 'floor';
                }
            }
        }
    }

    generateLShape(centerX, centerY) {
        const armWidth = Math.floor(this.width * 0.3);
        const armLength = Math.floor(this.height * 0.6);
        
        // Horizontal arm
        for (let x = centerX - armLength/2; x < centerX + armLength/2; x++) {
            for (let y = centerY - armWidth/2; y < centerY + armWidth/2; y++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    this.grid[x][y] = 'floor';
                }
            }
        }
        
        // Vertical arm
        for (let x = centerX - armWidth/2; x < centerX + armWidth/2; x++) {
            for (let y = centerY; y < centerY + armLength; y++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    this.grid[x][y] = 'floor';
                }
            }
        }
    }

    generateTShape(centerX, centerY) {
        const armWidth = Math.floor(this.width * 0.2);
        const armLength = Math.floor(this.height * 0.4);
        
        // Horizontal arm
        for (let x = centerX - armLength; x < centerX + armLength; x++) {
            for (let y = centerY - armWidth/2; y < centerY + armWidth/2; y++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    this.grid[x][y] = 'floor';
                }
            }
        }
        
        // Vertical arm
        for (let x = centerX - armWidth/2; x < centerX + armWidth/2; x++) {
            for (let y = centerY; y < centerY + armLength; y++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    this.grid[x][y] = 'floor';
                }
            }
        }
    }

    generateIrregular(centerX, centerY) {
        // Generate multiple connected blobs
        const numBlobs = random(2, 4);
        for (let i = 0; i < numBlobs; i++) {
            const blobX = centerX + random(-this.width/3, this.width/3);
            const blobY = centerY + random(-this.height/3, this.height/3);
            const blobRadius = random(3, 8);
            
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    const distance = dist(x, y, blobX, blobY);
                    if (distance <= blobRadius) {
                        this.grid[x][y] = 'floor';
                    }
                }
            }
        }
        
        // Connect blobs with corridors
        this.connectBlobs();
    }

    connectBlobs() {
        // Simple corridor generation between floor areas
        for (let x = 1; x < this.width - 1; x++) {
            for (let y = 1; y < this.height - 1; y++) {
                if (this.grid[x][y] === 'floor') {
                    // Randomly extend floor areas
                    if (random() < 0.3) {
                        const dirX = random([-1, 0, 1]);
                        const dirY = random([-1, 0, 1]);
                        const newX = x + dirX;
                        const newY = y + dirY;
                        if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
                            this.grid[newX][newY] = 'floor';
                        }
                    }
                }
            }
        }
    }

    generateInternalWalls() {
        const numWalls = random(2, 6);
        for (let i = 0; i < numWalls; i++) {
            const wallX = Math.floor(random(1, this.width - 1));
            const wallY = Math.floor(random(1, this.height - 1));
            const wallWidth = Math.floor(random(1, 4));
            const wallHeight = Math.floor(random(1, 4));
            
            for (let wx = wallX; wx < wallX + wallWidth && wx < this.width - 1; wx++) {
                for (let wy = wallY; wy < wallY + wallHeight && wy < this.height - 1; wy++) {
                    if (wx > 0 && wy > 0 && this.grid[wx][wy] === 'floor') {
                        this.grid[wx][wy] = 'wall';
                    }
                }
            }
        }
    }

    generateObstacles() {
        const numObstacles = random(3, 10);
        for (let i = 0; i < numObstacles; i++) {
            const obsX = Math.floor(random(1, this.width - 1));
            const obsY = Math.floor(random(1, this.height - 1));
            
            if (this.grid[obsX][obsY] === 'floor') {
                const types = ['rock', 'crystal', 'ore'];
                this.grid[obsX][obsY] = random(types);
            }
        }
    }

    checkCollision(x, y, size) {
        // Check if player is outside room boundaries
        const roomLeft = this.x * gameState.gridSize;
        const roomRight = (this.x + this.width) * gameState.gridSize;
        const roomTop = this.y * gameState.gridSize;
        const roomBottom = (this.y + this.height) * gameState.gridSize;

        if (x - size/2 < roomLeft || x + size/2 > roomRight ||
            y - size/2 < roomTop || y + size/2 > roomBottom) {
            return true;
        }

        // Check wall collisions within room
        const gridX = Math.floor((x - roomLeft) / gameState.gridSize);
        const gridY = Math.floor((y - roomTop) / gameState.gridSize);
        
        if (gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height) {
            return this.grid[gridX][gridY] === 'wall';
        }
        
        return false; // No collision if outside grid bounds but inside room
    }

    pushOutOfWalls(player) {
        const roomLeft = this.x * gameState.gridSize;
        const roomTop = this.y * gameState.gridSize;
        const gridX = Math.floor((player.x - roomLeft) / gameState.gridSize);
        const gridY = Math.floor((player.y - roomTop) / gameState.gridSize);
        
        if (gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height) {
            if (this.grid[gridX][gridY] === 'wall') {
                // Find nearest floor position
                let nearestFloor = this.findNearestFloor(gridX, gridY);
                if (nearestFloor) {
                    player.x = roomLeft + nearestFloor.x * gameState.gridSize + gameState.gridSize/2;
                    player.y = roomTop + nearestFloor.y * gameState.gridSize + gameState.gridSize/2;
                }
            }
        }
    }

    findNearestFloor(startX, startY) {
        const maxDistance = 5;
        for (let distance = 1; distance <= maxDistance; distance++) {
            for (let dx = -distance; dx <= distance; dx++) {
                for (let dy = -distance; dy <= distance; dy++) {
                    const newX = startX + dx;
                    const newY = startY + dy;
                    if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
                        if (this.grid[newX][newY] === 'floor') {
                            return {x: newX, y: newY};
                        }
                    }
                }
            }
        }
        return null;
    }

    draw() {
        // Draw room background
        fill(50, 50, 50);
        noStroke();
        rect(this.x * gameState.gridSize, this.y * gameState.gridSize, 
             this.width * gameState.gridSize, this.height * gameState.gridSize);

        // Draw grid cells
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const cellX = (this.x + x) * gameState.gridSize;
                const cellY = (this.y + y) * gameState.gridSize;
                
                if (this.grid[x][y] === 'wall') {
                    fill(100, 100, 100);
                    rect(cellX, cellY, gameState.gridSize, gameState.gridSize);
                } else if (this.grid[x][y] === 'rock') {
                    fill(80, 80, 80);
                    ellipse(cellX + gameState.gridSize/2, cellY + gameState.gridSize/2, 
                           gameState.gridSize * 0.6);
                } else if (this.grid[x][y] === 'crystal') {
                    fill(0, 255, 255);
                    ellipse(cellX + gameState.gridSize/2, cellY + gameState.gridSize/2, 
                           gameState.gridSize * 0.6);
                } else if (this.grid[x][y] === 'ore') {
                    fill(255, 165, 0);
                    ellipse(cellX + gameState.gridSize/2, cellY + gameState.gridSize/2, 
                           gameState.gridSize * 0.6);
                }
            }
        }
    }
} 