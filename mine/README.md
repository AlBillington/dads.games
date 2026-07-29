# Mining Game

A procedural mining game inspired by Stardew Valley's mining system, built with p5.js.

## Features

- **Procedural Level Generation**: Each level is randomly generated with multiple rooms
- **Character Movement**: Smooth player movement with WASD or arrow keys
- **Level Progression**: Find the exit to advance to deeper levels
- **Health System**: Player health display with visual health bar
- **Random Obstacles**: Each room contains random walls, rocks, crystals, and ore deposits

## Controls

- **W** or **Up Arrow**: Move up
- **S** or **Down Arrow**: Move down
- **A** or **Left Arrow**: Move left
- **D** or **Right Arrow**: Move right

## How to Play

1. Open `index.html` in a web browser
2. Use WASD or arrow keys to move your character (green circle)
3. Navigate through the randomly generated rooms
4. Find the yellow pulsing exit (↓ symbol) to advance to the next level
5. Each level goes deeper into the mine and becomes more challenging

## Game Elements

- **Player**: Green circle with health bar
- **Rooms**: Gray rectangular areas with random internal walls
- **Walls**: Gray rectangular obstacles within rooms
- **Obstacles**: 
  - Gray circles: Rocks
  - Cyan circles: Crystals
  - Orange circles: Ore deposits
- **Exit**: Yellow pulsing circle with down arrow

## Technical Details

- Built with p5.js for graphics and input handling
- Procedural generation using random room layouts
- Collision detection system
- Modular class-based architecture for easy expansion

## Future Enhancements

This framework is designed to be easily expandable for:
- Enemy AI and combat system
- Mining mechanics for collecting resources
- Inventory system
- Equipment and upgrades
- Factory/crafting system
- More complex level generation algorithms 