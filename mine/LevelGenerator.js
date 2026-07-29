class LevelGenerator {
    constructor() {
        this.roomSize = 20; // Grid-based room size
        this.roomSpacing = 5;
    }

    generateLevel(level) {
        const rooms = [];
        const numRooms = 3 + Math.floor(level / 5);
        
        // Generate main room
        const mainRoom = new Room(10, 10, this.roomSize, this.roomSize);
        rooms.push(mainRoom);

        // Generate additional rooms
        for (let i = 1; i < numRooms; i++) {
            const angle = (TWO_PI / (numRooms - 1)) * i;
            const distance = this.roomSize + this.roomSpacing;
            const roomX = 10 + Math.floor(cos(angle) * distance);
            const roomY = 10 + Math.floor(sin(angle) * distance);
            
            const room = new Room(roomX, roomY, this.roomSize, this.roomSize);
            rooms.push(room);
        }

        return rooms;
    }
} 