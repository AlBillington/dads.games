// Game state
let gameState = {
    currentLevel: 1,
    depth: 0,
    player: null,
    currentRoom: null,
    rooms: [],
    exit: null,
    camera: null,
    gridSize: 32
};

// Game functions
function setup() {
    const canvas = createCanvas(800, 600);
    canvas.parent('game-container');
    
    // Initialize camera
    gameState.camera = new Camera();
    
    // Initialize player
    gameState.player = new Player(width/2, height/2);
    
    // Generate first level
    generateLevel(gameState.currentLevel);
    
    // Update UI
    updateUI();
}

function draw() {
    background(20, 20, 20);
    
    // Update camera to follow player
    gameState.camera.follow(gameState.player);
    gameState.camera.apply();
    
    // Draw rooms
    gameState.rooms.forEach(room => room.draw());
    
    // Draw exit
    if (gameState.exit) {
        gameState.exit.update();
        gameState.exit.draw();
    }
    
    // Update and draw player
    gameState.player.update();
    gameState.player.draw();
    
    // Reset camera for UI
    resetMatrix();
    
    // Update UI
    updateUI();
}

function generateLevel(level) {
    const generator = new LevelGenerator();
    gameState.rooms = generator.generateLevel(level);
    
    // Place player in center of first room
    const firstRoom = gameState.rooms[0];
    gameState.player.x = (firstRoom.x + firstRoom.width/2) * gameState.gridSize;
    gameState.player.y = (firstRoom.y + firstRoom.height/2) * gameState.gridSize;
    
    // Place exit in last room
    const lastRoom = gameState.rooms[gameState.rooms.length - 1];
    gameState.exit = new Exit(
        lastRoom.x + Math.floor(lastRoom.width / 2),
        lastRoom.y + Math.floor(lastRoom.height / 2)
    );
    
    // Update depth
    gameState.depth = (level - 1) * 10;
}

function nextLevel() {
    gameState.currentLevel++;
    generateLevel(gameState.currentLevel);
    updateUI();
}

function updateUI() {
    document.getElementById('level-display').textContent = gameState.currentLevel;
    document.getElementById('depth-display').textContent = gameState.depth;
    document.getElementById('health-display').textContent = gameState.player.health;
    
    // Add debug info
    const debugInfo = document.createElement('div');
    debugInfo.innerHTML = `
        <div>Player: (${Math.round(gameState.player.x)}, ${Math.round(gameState.player.y)})</div>
        <div>Camera: (${Math.round(gameState.camera.x)}, ${Math.round(gameState.camera.y)})</div>
        <div>W/Up: ${keyIsDown(87) || keyIsDown(UP_ARROW)}</div>
        <div>S/Down: ${keyIsDown(83) || keyIsDown(DOWN_ARROW)}</div>
        <div>A/Left: ${keyIsDown(65) || keyIsDown(LEFT_ARROW)}</div>
        <div>D/Right: ${keyIsDown(68) || keyIsDown(RIGHT_ARROW)}</div>
    `;
    
    // Remove old debug info if it exists
    const oldDebug = document.getElementById('debug-info');
    if (oldDebug) {
        oldDebug.remove();
    }
    
    debugInfo.id = 'debug-info';
    debugInfo.style.position = 'absolute';
    debugInfo.style.top = '10px';
    debugInfo.style.right = '10px';
    debugInfo.style.color = '#fff';
    debugInfo.style.fontSize = '12px';
    debugInfo.style.background = 'rgba(0, 0, 0, 0.7)';
    debugInfo.style.padding = '10px';
    debugInfo.style.borderRadius = '5px';
    
    document.getElementById('game-container').appendChild(debugInfo);
} 