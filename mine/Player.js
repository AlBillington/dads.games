class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = gameState.gridSize * 0.8;
        this.speed = 4;
        this.health = 100;
        this.maxHealth = 100;
        this.color = '#00ff00';
    }

    update() {
        // Handle input with smooth movement
        if (keyIsDown(87) || keyIsDown(UP_ARROW)) { // W or Up
            this.y -= this.speed;
        }
        if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) { // S or Down
            this.y += this.speed;
        }
        if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) { // A or Left
            this.x -= this.speed;
        }
        if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) { // D or Right
            this.x += this.speed;
        }

        // Check collisions with walls and room boundaries
        this.handleCollisions();

        // Check collision with exit
        if (this.checkExitCollision()) {
            nextLevel();
        }
    }

    handleCollisions() {
        // Find which room the player is in
        let currentRoom = null;
        for (let room of gameState.rooms) {
            const roomLeft = room.x * gameState.gridSize;
            const roomRight = (room.x + room.width) * gameState.gridSize;
            const roomTop = room.y * gameState.gridSize;
            const roomBottom = (room.y + room.height) * gameState.gridSize;
            
            if (this.x >= roomLeft && this.x <= roomRight && 
                this.y >= roomTop && this.y <= roomBottom) {
                currentRoom = room;
                break;
            }
        }
        
        // If player is not in any room, push them to the nearest room
        if (!currentRoom) {
            this.pushToNearestRoom();
            return;
        }
        
        // Check collision with current room only
        if (currentRoom.checkCollision(this.x, this.y, this.size)) {
            this.pushOutOfCollision(currentRoom);
        }
    }

    pushToNearestRoom() {
        let nearestRoom = null;
        let nearestDistance = Infinity;
        
        for (let room of gameState.rooms) {
            const roomCenterX = (room.x + room.width/2) * gameState.gridSize;
            const roomCenterY = (room.y + room.height/2) * gameState.gridSize;
            const distance = dist(this.x, this.y, roomCenterX, roomCenterY);
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestRoom = room;
            }
        }
        
        if (nearestRoom) {
            // Push player to center of nearest room
            this.x = (nearestRoom.x + nearestRoom.width/2) * gameState.gridSize;
            this.y = (nearestRoom.y + nearestRoom.height/2) * gameState.gridSize;
        }
    }

    pushOutOfCollision(room) {
        const playerLeft = this.x - this.size/2;
        const playerRight = this.x + this.size/2;
        const playerTop = this.y - this.size/2;
        const playerBottom = this.y + this.size/2;

        // Check room boundary collisions
        const roomLeft = room.x * gameState.gridSize;
        const roomRight = (room.x + room.width) * gameState.gridSize;
        const roomTop = room.y * gameState.gridSize;
        const roomBottom = (room.y + room.height) * gameState.gridSize;

        // Push out of room boundaries
        if (playerLeft < roomLeft) this.x = roomLeft + this.size/2;
        if (playerRight > roomRight) this.x = roomRight - this.size/2;
        if (playerTop < roomTop) this.y = roomTop + this.size/2;
        if (playerBottom > roomBottom) this.y = roomBottom - this.size/2;

        // Check wall collisions within room
        room.pushOutOfWalls(this);
    }

    draw() {
        fill(this.color);
        noStroke();
        ellipse(this.x, this.y, this.size);
        
        // Draw health bar
        this.drawHealthBar();
    }

    drawHealthBar() {
        const barWidth = gameState.gridSize;
        const barHeight = 6;
        const barX = this.x - barWidth/2;
        const barY = this.y - this.size/2 - 15;
        
        // Background
        fill(255, 0, 0);
        rect(barX, barY, barWidth, barHeight);
        
        // Health
        fill(0, 255, 0);
        rect(barX, barY, (this.health / this.maxHealth) * barWidth, barHeight);
    }

    checkExitCollision() {
        if (gameState.exit) {
            const d = dist(this.x, this.y, gameState.exit.x, gameState.exit.y);
            return d < (this.size/2 + gameState.exit.size/2);
        }
        return false;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            // Game over logic could go here
        }
    }
} 