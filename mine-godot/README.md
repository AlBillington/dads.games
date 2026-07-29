# Mining Game - VS Code + Godot Development

A procedural mining game built with Godot 4 and developed entirely in VS Code.

## 🚀 **VS Code + Godot Setup**

### Prerequisites
1. Install [Godot 4.2+](https://godotengine.org/download)
2. Install [VS Code](https://code.visualstudio.com/)
3. Install the [Godot Tools](https://marketplace.visualstudio.com/items?itemName=neikeq.godot-csharp-vscode) extension

### Setup Steps

1. **Install Godot Tools Extension**
   ```bash
   # In VS Code, go to Extensions (Ctrl+Shift+X)
   # Search for "Godot Tools" and install it
   ```

2. **Configure Godot for External Editor**
   - Open Godot
   - Go to Editor → Editor Settings
   - Search for "External"
   - Set "Exec Path" to your VS Code executable
   - Set "Exec Flags" to: `--wait --new-window`

3. **Open Project in VS Code**
   ```bash
   # In VS Code, File → Open Folder
   # Select the mine-godot folder
   ```

4. **Enable Godot Language Server**
   - In VS Code, press Ctrl+Shift+P
   - Type "Godot Tools: Enable Language Server"
   - Select it

## 🎮 **Development Workflow**

### **VS Code Features You Get:**
- ✅ **IntelliSense** for GDScript
- ✅ **Auto-completion** for Godot classes and methods
- ✅ **Error detection** and syntax highlighting
- ✅ **Debugging** support
- ✅ **Git integration** with VS Code
- ✅ **Extensions** like GitLens, Bracket Pair Colorizer, etc.

### **Godot Features You Keep:**
- ✅ **Built-in physics** (no collision coding needed!)
- ✅ **Scene system** (visual node tree)
- ✅ **Animation system**
- ✅ **UI system**
- ✅ **Asset management**
- ✅ **Export system**

## 📁 **Project Structure**

```
mine-godot/
├── project.godot          # Godot project config
├── scenes/                # Scene files (.tscn)
│   ├── Main.tscn         # Main game scene
│   ├── Player.tscn       # Player scene
│   ├── Room.tscn         # Room scene
│   └── Exit.tscn         # Exit scene
├── scripts/               # GDScript files (.gd)
│   ├── GameManager.gd    # Main game logic
│   ├── Player.gd         # Player behavior
│   ├── Room.gd           # Room generation
│   └── Exit.gd           # Exit behavior
└── assets/                # Art assets
    ├── sprites/          # Sprite files
    ├── tilesets/         # TileSet resources
    └── sounds/           # Audio files
```

## 🛠 **VS Code Development Tips**

### **1. Use Godot for Scene Setup Only**
- Create basic scenes in Godot (nodes, transforms, etc.)
- Write all logic in VS Code
- Use Godot's visual editor for UI layout

### **2. Leverage Godot's Built-in Systems**
```gdscript
# No need to code collision detection!
extends CharacterBody2D

func _physics_process(delta):
    var input_vector = Vector2.ZERO
    input_vector.x = Input.get_axis("move_left", "move_right")
    input_vector.y = Input.get_axis("move_up", "move_down")
    
    velocity = input_vector * speed
    move_and_slide()  # Godot handles all collision!
```

### **3. Use Signals for Clean Architecture**
```gdscript
# In Player.gd
signal health_changed(new_health)

func take_damage(amount):
    health -= amount
    health_changed.emit(health)  # VS Code provides IntelliSense for this!

# In GameManager.gd
func _ready():
    player.health_changed.connect(_on_player_health_changed)

func _on_player_health_changed(new_health):
    update_ui()  # Clean separation of concerns
```

## 🎯 **Alternative Options**

### **2. Unity + VS Code**
- Install Unity VS Code extension
- Get C# IntelliSense and debugging
- Unity handles physics, rendering, etc.

### **3. MonoGame + VS Code**
- Pure C# game development
- More control but more boilerplate
- Great for learning game development fundamentals

### **4. Phaser.js + VS Code**
- JavaScript game development
- Web-based, easy deployment
- Good for 2D games

## 🏆 **Why Godot + VS Code is Perfect**

### **What You Code in VS Code:**
- Game logic and algorithms
- Procedural generation
- State management
- UI logic
- Custom systems

### **What Godot Handles:**
- Physics and collision detection
- Rendering and optimization
- Input handling
- Audio system
- Animation system
- Scene management
- Cross-platform export

## 🚀 **Getting Started**

1. **Clone/Download** this project
2. **Open in VS Code** with Godot Tools extension
3. **Open in Godot** to set up basic scenes
4. **Code in VS Code** for all game logic
5. **Test in Godot** by pressing F5

## 📚 **VS Code Extensions for Game Dev**

- **Godot Tools** - GDScript support
- **GitLens** - Enhanced Git integration
- **Bracket Pair Colorizer** - Better code readability
- **Auto Rename Tag** - Helpful for UI work
- **Thunder Client** - API testing (if you add backend features)

## 🎮 **Example: Adding a New Feature**

Want to add mining mechanics? Here's the workflow:

1. **In Godot**: Create a new scene for mining tools
2. **In VS Code**: Write the mining logic in GDScript
3. **In Godot**: Set up the visual elements and animations
4. **In VS Code**: Connect everything with signals
5. **Test**: Run in Godot to see it working

This gives you the best of both worlds - professional coding environment with powerful game engine features! 