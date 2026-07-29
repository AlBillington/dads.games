extends Node2D

# Game state
var current_level: int = 1
var depth: int = 0
var player: CharacterBody2D
var rooms: Array[Room] = []
var exit: Area2D
var camera: Camera2D

# Constants
const GRID_SIZE: int = 32
const ROOM_SIZE: int = 20
const ROOM_SPACING: int = 5

# UI references
@onready var level_label: Label = $UI/LevelLabel
@onready var depth_label: Label = $UI/DepthLabel
@onready var health_label: Label = $UI/HealthLabel

func _ready():
	# Initialize camera with smooth following
	camera = Camera2D.new()
	camera.enabled = true
	camera.position_smoothing_enabled = true
	camera.position_smoothing_speed = 5.0
	add_child(camera)
	
	# Initialize player
	player = preload("res://scenes/Player.tscn").instantiate()
	add_child(player)
	camera.target = player
	
	# Connect player signals for clean architecture
	player.health_changed.connect(_on_player_health_changed)
	
	# Generate first level
	generate_level(current_level)
	
	# Update UI
	update_ui()

func _process(_delta):
	update_ui()

func generate_level(level: int):
	# Clear existing rooms and exit
	for room in rooms:
		room.queue_free()
	rooms.clear()
	
	if exit:
		exit.queue_free()
		exit = null
	
	# Generate rooms based on level
	var num_rooms = 3 + (level / 5)
	
	# Generate main room
	var main_room = Room.new()
	main_room.position = Vector2(10 * GRID_SIZE, 10 * GRID_SIZE)
	main_room.room_size = Vector2(ROOM_SIZE, ROOM_SIZE)
	main_room.generate_room()
	add_child(main_room)
	rooms.append(main_room)
	
	# Generate additional rooms in a circle pattern
	for i in range(1, num_rooms):
		var angle = (2 * PI / (num_rooms - 1)) * i
		var distance = ROOM_SIZE + ROOM_SPACING
		var room_x = 10 + int(cos(angle) * distance)
		var room_y = 10 + int(sin(angle) * distance)
		
		var room = Room.new()
		room.position = Vector2(room_x * GRID_SIZE, room_y * GRID_SIZE)
		room.room_size = Vector2(ROOM_SIZE, ROOM_SIZE)
		room.generate_room()
		add_child(room)
		rooms.append(room)
	
	# Place player in center of first room
	var first_room = rooms[0]
	player.position = first_room.position + Vector2(ROOM_SIZE * GRID_SIZE / 2, ROOM_SIZE * GRID_SIZE / 2)
	
	# Place exit in last room
	var last_room = rooms[-1]
	exit = preload("res://scenes/Exit.tscn").instantiate()
	exit.position = last_room.position + Vector2(ROOM_SIZE * GRID_SIZE / 2, ROOM_SIZE * GRID_SIZE / 2)
	add_child(exit)
	
	# Connect exit signal
	exit.body_entered.connect(_on_exit_entered)
	
	# Update depth
	depth = (level - 1) * 10

func next_level():
	current_level += 1
	generate_level(current_level)

func update_ui():
	level_label.text = "Level: " + str(current_level)
	depth_label.text = "Depth: " + str(depth) + "m"
	health_label.text = "Health: " + str(player.health)

func _on_exit_entered(body):
	if body == player:
		next_level()

func _on_player_health_changed(new_health):
	# This is called whenever the player's health changes
	# Clean separation of concerns - UI updates automatically
	pass 