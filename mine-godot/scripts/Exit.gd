extends Area2D

# Visual components
@onready var sprite: Sprite2D = $Sprite2D
@onready var collision_shape: CollisionShape2D = $CollisionShape2D

# Animation properties
var pulse_speed: float = 2.0
var pulse_amount: float = 0.3
var base_scale: Vector2 = Vector2(1.0, 1.0)
var time: float = 0.0

func _ready():
	# Set up collision shape
	if not collision_shape.shape:
		var shape = CircleShape2D.new()
		shape.radius = 16
		collision_shape.shape = shape
	
	# Create a glowing exit sprite
	if not sprite.texture:
		var image = Image.create(32, 32, false, Image.FORMAT_RGBA8)
		image.fill(Color.YELLOW)
		var texture = ImageTexture.create_from_image(image)
		sprite.texture = texture
	
	# Set up the sprite
	sprite.modulate = Color.YELLOW
	base_scale = sprite.scale

func _process(delta):
	# Pulsing animation
	time += delta
	var pulse = sin(time * pulse_speed) * pulse_amount
	sprite.scale = base_scale * (1.0 + pulse)
	
	# Color cycling
	var hue = fmod(time * 0.5, 1.0)
	sprite.modulate = Color.from_hsv(hue, 0.8, 1.0)

# Signal is automatically connected in GameManager
# body_entered signal will be emitted when player touches the exit 