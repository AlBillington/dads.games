class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.smoothness = 0.1;
    }

    follow(target) {
        this.targetX = target.x - width/2;
        this.targetY = target.y - height/2;
        
        // Smooth camera movement
        this.x += (this.targetX - this.x) * this.smoothness;
        this.y += (this.targetY - this.y) * this.smoothness;
    }

    apply() {
        translate(-this.x, -this.y);
    }
} 