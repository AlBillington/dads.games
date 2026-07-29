let cells = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
    cells = [];
  for (let i = 0; i < 12; i++) {
    // choose a random point on the canvas that is at least 100 away from any edge
    let randomStart = createVector(random(100, width/scaleFactor - 100), random(100, height/scaleFactor - 100));
    genes = new FishGenes();
    genes.generateRandom();
    cells[i] = new Fish(randomStart, genes);
  }
}

const scaleFactor = 0.35;   

function draw() {
    scale(scaleFactor); // Scale down the entire drawing

  background(40, 44, 52);
  cells.forEach((f) => {
    f.resolve();
    f.display();
  });

}

function mousePressed() {
    for (let fish of cells) {
      if (fish.contains(mouseX, mouseY)) {
        console.log("Clicked on a fish:", fish); // Log the clicked fish
        return fish; // You can do more actions here
      }
    }
  }

class FishGenes {
    constructor() {
        this.genes = [];
        this.mutationRate = 0.01;
        this.mutationAmount = 0.1;
    }
    
    generateRandom() {
        for (let i = 0; i < 30; i++) {
        this.genes[i] = random(-PI, PI);
        }
    }
    
    crossover(partner) {
        let child = new FishGenes();
        for (let i = 0; i < 30; i++) {
        child.genes[i] = random() < 0.5 ? this.genes[i] : partner.genes[i];
        }
        return child;
    }
    
    mutate() {
        for (let i = 0; i < 30; i++) {
            if (random() < this.mutationRate) {
                this.genes[i] += random(-this.mutationAmount, this.mutationAmount);
            }
        }
    }

    getBodyColor() {
        return color(this.genes[0] * 255, this.genes[1] * 255, this.genes[2] * 255);
    }

    getFinColor() {
        return color(this.genes[3] * 255, this.genes[4] * 255, this.genes[5] * 255);
    }

    getSpeed() {
        return map(this.genes[6], -PI, PI, 1, 15);
    }

    getWidth() {
        return map(this.genes[7], -PI, PI, 40, 120);
    }

    getSize() {
        return map(this.genes[8], -PI, PI, 5, 15);
    }

    getMass () {   
        // calculate approximate volume based on length and width
        let volume = 0;
        let bodyWidth = this.getBodyWidth();
        let size = this.getSize();
        for (let i = 0; i < size; i++) {
            volume += bodyWidth[i] ** 2;
        }
    }

    getBodyWidth() {
        // use a gene to determine the number of vertebrae from 5 to 15
        let vertebrae = this.getSize();
        
        // use a gene to determine the average width of the body from 20 to 80
        let averageWidth = this.getWidth();

        let bodyWidth = [];
        for (let i = 0; i < vertebrae; i++) {
            // generate a spline curve for the body using the parameters vertebrae and averageWidth
            // the body width should be wider near the head and taper off towards the tail
            let width = averageWidth * (1 - i / vertebrae);
            bodyWidth.push(width);
        }
        return bodyWidth;
    }

    brain() {
        // use the remaining genes to determine the fish's behavior
        // this will control where the fish is trying to move based on what it sees
        // inputs: distance of nearest food, angle of nearest food
        // outputs: target position to move towards
        
        
    }   
}

class Fish {
  constructor(origin, genes) {
    this.genes = genes;
    this.spine = new Chain(origin, 12, 64, PI / 8); // Assuming a Chain class is implemented
    this.bodyColor = genes.getBodyColor();
    this.finColor = genes.getFinColor();

    // Width of the fish at each vertebra
    this.bodyWidth = genes.getBodyWidth();
    this.len = this.bodyWidth.length;
        // Movement properties
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        //apply speed to the velocity
        this.velocity.setMag(genes.getSpeed());
        this.targetVelocity = this.velocity.copy(); // Direction to gradually move towards
        this.speed = 2; // Movement speed
        this.changeDirectionFrames = 120; // Time between direction changes
        this.boundaryBuffer = 250; // Buffer distance from canvas edges
  }
  
resolve() {
    let headPos = this.spine.joints[0];
  
    // Gradually change direction towards the target velocity
    this.velocity.lerp(this.targetVelocity, 0.05); // Interpolate current velocity toward target
  
    // Update position based on interpolated velocity
    let targetPos = p5.Vector.add(headPos, this.velocity);
  
    // Check proximity to edges and steer away
    if (targetPos.x < this.boundaryBuffer) {
      this.targetVelocity.x = abs(this.targetVelocity.x); // Steer right
    } else if (targetPos.x > width/scaleFactor - this.boundaryBuffer) {
      this.targetVelocity.x = -abs(this.targetVelocity.x); // Steer left
    }
    if (targetPos.y < this.boundaryBuffer) {
      this.targetVelocity.y = abs(this.targetVelocity.y); // Steer down
    } else if (targetPos.y > height/scaleFactor - this.boundaryBuffer) {
      this.targetVelocity.y = -abs(this.targetVelocity.y); // Steer up
    }
  
    // Periodically set a new random target velocity (avoids edge locking)
    if (random() < .001) {
      this.targetVelocity = p5.Vector.random2D().mult(this.speed);
    }
  
    // Resolve the chain towards the updated position
    this.spine.resolve(targetPos);
  }

    // Method to check if the mouse is within the fish's body
    contains(x, y) {
        let headPos = this.spine.joints[0];
        let bodyRadius = this.bodyWidth[0] / 2; // Use the head's width as the fish's approximate radius
        let distance = dist(x, y, headPos.x, headPos.y);
        return distance <= bodyRadius; // Return true if the click is within the radius
      }

display() {
    strokeWeight(4);
    stroke(255);
    fill(this.finColor);

    // Alias for joints and angles
    let j = this.spine.joints;
    let a = this.spine.angles;

    // Helper function to compute relative angle difference
    const relativeAngleDiff = (angle1, angle2) => atan2(sin(angle1 - angle2), cos(angle1 - angle2));

    // Relative angle calculations
    let headToMid1 = relativeAngleDiff(a[0], a[6]);
    let headToMid2 = relativeAngleDiff(a[0], a[7]);
    let headToTail = headToMid1 + relativeAngleDiff(a[6], a[11]);

    // Pectoral fins
    this.drawFin(floor(this.len / 3), PI / 3, 160, 64, -PI / 4, 2); // Right
    this.drawFin(floor(this.len / 3), -PI / 3, 160, 64, PI / 4, 2); // Left

    // Ventral fins
    this.drawFin(floor(this.len / 3 * 2), PI / 2, 96, 32, -PI / 4, 6); // Right
    this.drawFin(floor(this.len / 3 * 2), -PI / 2, 96, 32, PI / 4, 6); // Left

    // Caudal fins
   // this.drawCaudalFin(j, a, headToTail);

    // Body
    this.drawBody(j, a);

    // Dorsal fin
   // this.drawDorsalFin(j, a, headToMid1, headToMid2);

    // Eyes
    fill(255);
    ellipse(this.getPosX(0, PI / 2, -28), this.getPosY(0, PI / 2, -28), 24, 24); // Right
    ellipse(this.getPosX(0, -PI / 2, -28), this.getPosY(0, -PI / 2, -28), 24, 24); // Left

  }

  drawFin(index, angle, width, height, rotation, angleIndex) {
    push();
    translate(this.getPosX(index, angle, 0), this.getPosY(index, angle, 0));
    rotate(this.spine.angles[angleIndex] + rotation);
    ellipse(0, 0, width, height);
    pop();
  }

  drawCaudalFin(joints, angles, headToTail) {
    beginShape();
    for (let i = 8; i < 12; i++) {
      let tailWidth = 1.5 * headToTail * (i - 8) ** 2;
      curveVertex(
        joints[i].x + cos(angles[i] - PI / 2) * tailWidth,
        joints[i].y + sin(angles[i] - PI / 2) * tailWidth
      );
    }
    for (let i = 11; i >= 8; i--) {
      let tailWidth = constrain(headToTail * 6, -13, 13);
      curveVertex(
        joints[i].x + cos(angles[i] + PI / 2) * tailWidth,
        joints[i].y + sin(angles[i] + PI / 2) * tailWidth
      );
    }
    endShape(CLOSE);
  }

  drawBody(joints, angles) {
    fill(this.bodyColor);
    beginShape();
    const len = joints.length;
    
    for (let i = 0; i < len; i++) {
      curveVertex(this.getPosX(i, PI / 2, 0), this.getPosY(i, PI / 2, 0));
    }
    for (let i = len - 1; i >= 0; i--) {
      curveVertex(this.getPosX(i, -PI / 2, 0), this.getPosY(i, -PI / 2, 0));
    }

    
    // Top of the head (completes the loop)
    curveVertex(this.getPosX(0, -PI/6, 0), this.getPosY(0, -PI/6, 0));
    curveVertex(this.getPosX(0, 0, 4), this.getPosY(0, 0, 4));
    curveVertex(this.getPosX(0, PI/6, 0), this.getPosY(0, PI/6, 0));


    

    endShape(CLOSE);
  }

  drawDorsalFin(joints, angles, headToMid1, headToMid2) {
    fill(this.finColor);
    beginShape();
    vertex(joints[4].x, joints[4].y);
    bezierVertex(
      joints[5].x, joints[5].y,
      joints[6].x, joints[6].y,
      joints[7].x, joints[7].y
    );
    bezierVertex(
      joints[6].x + cos(angles[6] + PI / 2) * headToMid2 * 16,
      joints[6].y + sin(angles[6] + PI / 2) * headToMid2 * 16,
      joints[5].x + cos(angles[5] + PI / 2) * headToMid1 * 16,
      joints[5].y + sin(angles[5] + PI / 2) * headToMid1 * 16,
      joints[4].x, joints[4].y
    );
    endShape();
  }

  getPosX(i, angleOffset, lengthOffset) {
    return this.spine.joints[i].x + cos(this.spine.angles[i] + angleOffset) * (this.bodyWidth[i] + lengthOffset);
  }

  getPosY(i, angleOffset, lengthOffset) {
    return this.spine.joints[i].y + sin(this.spine.angles[i] + angleOffset) * (this.bodyWidth[i] + lengthOffset);
  }
}

