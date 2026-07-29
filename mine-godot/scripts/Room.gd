extends Node2D

# Room properties
var room_size: Vector2 = Vector2(20, 20)
var grid_size: int = 32
var room_type: String = "rectangle"

# Visual components
var walls: Array[StaticBody2D] = []
var floor_tiles: Array[Sprite2D] = []

# Room generation types
enum RoomShape {
	RECTANGLE,
	CIRCLE,
	CROSS,
	L_SHAPE,
	T_SHAPE,
	BLOB
}

func _ready():
	# Set up the room if not already generated
	if walls.size() == 0:
		generate_room()

func generate_room():
	# Clear existing walls and floors
	clear_room()
	
	# Choose random room shape
	var shape = RoomShape.values()[randi() % RoomShape.size()]
	
	match shape:
		RoomShape.RECTANGLE:
			generate_rectangle_room()
		RoomShape.CIRCLE:
			generate_circle_room()
		RoomShape.CROSS:
			generate_cross_room()
		RoomShape.L_SHAPE:
			generate_l_shape_room()
		RoomShape.T_SHAPE:
			generate_t_shape_room()
		RoomShape.BLOB:
			generate_blob_room()
	
	# Add some internal obstacles
	add_internal_obstacles()

func clear_room():
	# Remove existing walls
	for wall in walls:
		wall.queue_free()
	walls.clear()
	
	# Remove existing floor tiles
	for tile in floor_tiles:
		tile.queue_free()
	floor_tiles.clear()

func generate_rectangle_room():
	var width = int(room_size.x)
	var height = int(room_size.y)
	
	# Create floor tiles
	for x in range(width):
		for y in range(height):
			create_floor_tile(x, y)
	
	# Create walls
	create_wall_line(0, 0, width, 0)  # Top
	create_wall_line(0, height, width, height)  # Bottom
	create_wall_line(0, 0, 0, height)  # Left
	create_wall_line(width, 0, width, height)  # Right

func generate_circle_room():
	var center_x = int(room_size.x / 2)
	var center_y = int(room_size.y / 2)
	var radius = min(center_x, center_y) - 2
	
	# Create floor tiles in circle
	for x in range(int(room_size.x)):
		for y in range(int(room_size.y)):
			var distance = sqrt((x - center_x) * (x - center_x) + (y - center_y) * (y - center_y))
			if distance <= radius:
				create_floor_tile(x, y)
			elif distance <= radius + 1:
				create_wall(x, y)

func generate_cross_room():
	var width = int(room_size.x)
	var height = int(room_size.y)
	var center_x = width / 2
	var center_y = height / 2
	
	# Create cross pattern
	for x in range(width):
		for y in range(height):
			if x == center_x or y == center_y:
				create_floor_tile(x, y)
			elif (x >= center_x - 1 and x <= center_x + 1) or (y >= center_y - 1 and y <= center_y + 1):
				create_floor_tile(x, y)
			else:
				create_wall(x, y)

func generate_l_shape_room():
	var width = int(room_size.x)
	var height = int(room_size.y)
	
	# Create L shape
	for x in range(width):
		for y in range(height):
			if x < width / 2 or y < height / 2:
				create_floor_tile(x, y)
			else:
				create_wall(x, y)

func generate_t_shape_room():
	var width = int(room_size.x)
	var height = int(room_size.y)
	var center_x = width / 2
	
	# Create T shape
	for x in range(width):
		for y in range(height):
			if y < height / 2 or (x >= center_x - 1 and x <= center_x + 1):
				create_floor_tile(x, y)
			else:
				create_wall(x, y)

func generate_blob_room():
	var width = int(room_size.x)
	var height = int(room_size.y)
	var center_x = width / 2
	var center_y = height / 2
	
	# Create irregular blob using noise
	var noise = FastNoiseLite.new()
	noise.seed = randi()
	noise.frequency = 0.1
	
	for x in range(width):
		for y in range(height):
			var distance = sqrt((x - center_x) * (x - center_x) + (y - center_y) * (y - center_y))
			var noise_value = noise.get_noise_2d(x, y)
			var max_radius = min(center_x, center_y) - 2
			
			if distance <= max_radius + noise_value * 3:
				create_floor_tile(x, y)
			elif distance <= max_radius + noise_value * 3 + 1:
				create_wall(x, y)

func create_floor_tile(x: int, y: int):
	var tile = Sprite2D.new()
	var image = Image.create(grid_size, grid_size, false, Image.FORMAT_RGBA8)
	image.fill(Color.DARK_GRAY)
	var texture = ImageTexture.create_from_image(image)
	tile.texture = texture
	tile.position = Vector2(x * grid_size, y * grid_size)
	add_child(tile)
	floor_tiles.append(tile)

func create_wall(x: int, y: int):
	var wall = StaticBody2D.new()
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = Vector2(grid_size, grid_size)
	collision.shape = shape
	wall.add_child(collision)
	
	var sprite = Sprite2D.new()
	var image = Image.create(grid_size, grid_size, false, Image.FORMAT_RGBA8)
	image.fill(Color.BROWN)
	var texture = ImageTexture.create_from_image(image)
	sprite.texture = texture
	wall.add_child(sprite)
	
	wall.position = Vector2(x * grid_size, y * grid_size)
	add_child(wall)
	walls.append(wall)

func create_wall_line(start_x: int, start_y: int, end_x: int, end_y: int):
	if start_x == end_x:  # Vertical line
		for y in range(start_y, end_y + 1):
			create_wall(start_x, y)
	else:  # Horizontal line
		for x in range(start_x, end_x + 1):
			create_wall(x, start_y)

func add_internal_obstacles():
	# Add some random internal walls and obstacles
	var num_obstacles = randi_range(2, 5)
	
	for i in range(num_obstacles):
		var x = randi_range(2, int(room_size.x) - 3)
		var y = randi_range(2, int(room_size.y) - 3)
		
		# Check if position is free (no existing wall)
		var position_free = true
		for wall in walls:
			if wall.position == Vector2(x * grid_size, y * grid_size):
				position_free = false
				break
		
		if position_free:
			create_wall(x, y)

# Public method to check if a position is walkable
func is_walkable(world_position: Vector2) -> bool:
	var local_pos = world_position - position
	var grid_x = int(local_pos.x / grid_size)
	var grid_y = int(local_pos.y / grid_size)
	
	# Check if position is within room bounds
	if grid_x < 0 or grid_x >= room_size.x or grid_y < 0 or grid_y >= room_size.y:
		return false
	
	# Check if there's a wall at this position
	for wall in walls:
		var wall_grid_x = int(wall.position.x / grid_size)
		var wall_grid_y = int(wall.position.y / grid_size)
		if wall_grid_x == grid_x and wall_grid_y == grid_y:
			return false
	
	return true 