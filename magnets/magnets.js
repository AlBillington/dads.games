// Magnet Physics Game

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const magnets = [];
let selectedMagnet = null;
let offsetX = 0;
let offsetY = 0;

const friction = 0.95;
const angularDamping = 0.9; // Added angular damping
const highFriction = 0.2; // High damping friction when touching
const magnetStrength = 10; // All magnets have the same strength
const maxTorque = 0.05; // Limit torque to prevent wild spinning

// Magnet Object
class Magnet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.strength = magnetStrength;
    this.radius = 20;
    this.angle = Math.random() * Math.PI * 2; // Random pole orientation
    this.angularVelocity = 0;
    this.touching = false; // Track if magnet is touching another
    this.poles = [
      { angle: 0 },
      { angle: Math.PI / 2 },
      { angle: Math.PI },
      { angle: (3 * Math.PI) / 2 }
    ];
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.strength > 0 ? 'silver' : 'blue';
    ctx.fill();
    ctx.stroke();

    // Draw polarity directions
    this.poles.forEach((pole) => {
      const poleX = this.x + Math.cos(this.angle + pole.angle) * this.radius;
      const poleY = this.y + Math.sin(this.angle + pole.angle) * this.radius;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
     // ctx.lineTo(poleX, poleY);
      ctx.stroke();
    });
  }

  applyForce(fx, fy) {
    this.vx += fx;
    this.vy += fy;
  }

  applyTorque(torque) {
    this.angularVelocity += Math.max(-maxTorque, Math.min(maxTorque, torque)); // Clamp torque
  }

  update() {
    const damping = this.touching ? highFriction : friction; // Apply high friction if touching
    this.vx *= damping;
    this.vy *= damping;
    this.x += this.vx;
    this.y += this.vy;

    const angularDamp = this.touching ? highFriction : angularDamping; // Apply angular damping
    this.angularVelocity *= angularDamp;
    this.angle += this.angularVelocity;

    this.touching = false; // Reset touching flag
  }
}

// Add a new magnet
function addMagnet() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  magnets.push(new Magnet(x, y));
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  for (let magnet of magnets) {
    const dx = mouseX - magnet.x;
    const dy = mouseY - magnet.y;
    if (Math.sqrt(dx * dx + dy * dy) < magnet.radius) {
      selectedMagnet = magnet;
      offsetX = dx;
      offsetY = dy;
      break;
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (selectedMagnet) {
    selectedMagnet.x = e.clientX - offsetX;
    selectedMagnet.y = e.clientY - offsetY;
  }
});

canvas.addEventListener('mouseup', () => {
  selectedMagnet = null;
});

// Physics calculations
function applyPhysics() {
  magnets.forEach((m1, i) => {
    let totalFx = 0, totalFy = 0, totalTorque = 0;

    magnets.forEach((m2, j) => {
      if (i === j) return;

      const dx = m2.x - m1.x;
      const dy = m2.y - m1.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      // Collision detection
      const minDist = m1.radius + m2.radius;
      if (dist < minDist) {
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        m1.x -= nx * overlap / 2;
        m1.y -= ny * overlap / 2;
        m2.x += nx * overlap / 2;
        m2.y += ny * overlap / 2;
        m1.touching = true; // Mark as touching
        m2.touching = true; // Mark as touching
      }

      m1.poles.forEach((p1) => {
        const x1 = m1.x + Math.cos(m1.angle + p1.angle) * m1.radius;
        const y1 = m1.y + Math.sin(m1.angle + p1.angle) * m1.radius;

        m2.poles.forEach((p2) => {
          const x2 = m2.x + Math.cos(m2.angle + p2.angle) * m2.radius;
          const y2 = m2.y + Math.sin(m2.angle + p2.angle) * m2.radius;

          const pdx = x2 - x1;
          const pdy = y2 - y1;
          const pdistSq = pdx * pdx + pdy * pdy;
          const pdist = Math.sqrt(pdistSq);
          const force = magnetStrength / pdistSq;
          const fx = force * pdx / pdist;
          const fy = force * pdy / pdist;

          totalFx += fx;
          totalFy += fy;

          totalTorque += (Math.cos(p1.angle) * fy - Math.sin(p1.angle) * fx) * m1.radius;
        });
      });
    });

    m1.applyForce(totalFx, totalFy);
    m1.applyTorque(totalTorque);
  });
}

// Game loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  applyPhysics();
  magnets.forEach((magnet) => {
    magnet.update();
    magnet.draw();
  });
  requestAnimationFrame(update);
}

// Button to add magnets
document.body.insertAdjacentHTML('beforeend', '<button id="addMagnet">Add Magnet</button>');
document.getElementById('addMagnet').addEventListener('click', addMagnet);

update();
addMagnet()
addMagnet()