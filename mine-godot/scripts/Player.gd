extends CharacterBody2D

# Player stats
var health: int = 100
var max_health: int = 100
var speed: float = 200.0

# Visual components
@onready var sprite: Sprite2D = $Sprite2D
@onready var collision_shape: CollisionShape2D = $CollisionShape2D

# Signals for clean architecture
signal health_changed(new_health)
signal player_died

func _ready():
	# Set up collision shape if not already set
	if not collision_shape.shape:
		var shape = RectangleShape2D.new()
		shape.size = Vector2(24, 24)
		collision_shape.shape = shape
	
	# Create a simple colored rectangle for the player
	if not sprite.texture:
		var image = Image.create(24, 24, false, Image.FORMAT_RGBA8)
		image.fill(Color.BLUE)
		var texture = ImageTexture.create_from_image(image)
		sprite.texture = texture

func _physics_process(delta):
	# Get input vector - Godot handles all input mapping!
	var input_vector = Vector2.ZERO
	input_vector.x = Input.get_axis("move_left", "move_right")
	input_vector.y = Input.get_axis("move_up", "move_down")
	
	# Normalize diagonal movement
	if input_vector.length() > 0:
		input_vector = input_vector.normalized()
	
	# Set velocity and move - Godot handles all collision detection!
	velocity = input_vector * speed
	move_and_slide()
	
	# Optional: Add some visual feedback for movement
	if input_vector.length() > 0:
		# Slight scale animation when moving
		sprite.scale = Vector2(1.1, 1.1)
	else:
		sprite.scale = Vector2(1.0, 1.0)

func take_damage(amount: int):
	health = max(0, health - amount)
	health_changed.emit(health)
	
	# Visual feedback for taking damage
	sprite.modulate = Color.RED
	await get_tree().create_timer(0.1).timeout
	sprite.modulate = Color.WHITE
	
	if health <= 0:
		player_died.emit()

func heal(amount: int):
	health = min(max_health, health + amount)
	health_changed.emit(health)
	
	# Visual feedback for healing
	sprite.modulate = Color.GREEN
	await get_tree().create_timer(0.1).timeout
	sprite.modulate = Color.WHITE

func get_health_percentage() -> float:
	return float(health) / float(max_health)

# Public method to check if player is moving
func is_moving() -> bool:
	return velocity.length() > 0

# Public method to get movement direction
func get_movement_direction() -> Vector2:
	return velocity.normalized() 