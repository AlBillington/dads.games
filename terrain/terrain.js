function interpolateColors(color1, color2, blend) {
    let r = Math.round(color1[0] + (color2[0] - color1[0]) * blend);
    let g = Math.round(color1[1] + (color2[1] - color1[1]) * blend);
    let b = Math.round(color1[2] + (color2[2] - color1[2]) * blend);
    return [r, g, b, 255];
}

gridSize = 120

class TileType {   
    constructor(name, land, cutoff, color) {
        this.name = name;
        this.land = land;
        this.cutoff = cutoff;
        this.color = color;
    }
}

const tileTypes = [
    new TileType('water', false, 30, [0, 0, 255]),    // Blue - water
    new TileType('clay', true, 40, [255, 59, 59]),    // Red - clay 
    new TileType('wheat', true, 50, [243, 231, 67]),  // Green-yellow - plains
    new TileType('lumber', true, 60, [9, 38, 0]),     // Dark green - forest
    new TileType('wool', true, 70, [33, 159, 64]),     // Dark green - forest
    new TileType('stone', true, Infinity, [137, 75, 37])  // Brown - mountains
];
//rgb(243, 231, 67)


class Hex {  
    constructor(x, y, elevation, richness) {
        this.tileType = this.getTileType(elevation);
        this.elevation = elevation;
        //make a copy of tiletypes color
        let color = this.tileType.color.slice();
        if (this.tileType.land) {
            color.push(Math.floor(200 + richness * 5));
        }
        this.color = color;
        this.richness = richness;
        this.size = gridSize / 2;
        this.x = x;
        this.y = y;
        this.index = x * 100 + y;
    }

    getVertices() {
        let vertices = []
        const angle = TWO_PI / 6;
        for (let a = 0; a < TWO_PI; a += angle) {
            let sx = Math.round(this.x + cos(a) * this.size);
            let sy = Math.round(this.y + sin(a) * this.size);
            vertex(sx, sy);
            vertices.push([sx, sy]);
        }
        return vertices;
    }


    getTileType(elevation) {

        //rgb(186, 60, 25)
    
        for (let i = 0; i < tileTypes.length - 1; i++) {
            if (elevation < tileTypes[i].cutoff) {
                return tileTypes[i];
            }
        }
    
        // Return the last color if above all cutoffs
        return tileTypes[tileTypes.length - 1];
    }

    draw() {
        const vertices = this.getVertices(this.x, this.y, this.size);
        beginShape();
        fill(this.color);
        vertices.forEach(v => {
            vertex(v[0], v[1]);
        });
        endShape(CLOSE);
        if (this.tileType.land) {
            fill('white');
            circle(this.x, this.y, 30);
            textSize(20);
            fill(this.richness > 4 ? 'red' : 'black')
            textAlign(CENTER, CENTER);
            let textVal = ''
            for (let i = 0; i < this.richness; i++) {
                textVal += '.'
            }
            text(textVal, this.x, this.y-4);

            
        }
    }
}

class BuildLocation {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.index = x * 100 + y;
        this.active = false;
        this.level = 0;
        this.color = 'blue';
        this.neighbors = {};
        this.adjacentHexes = {};
        this.type = type;
    }

    upgrade(apply = false) {

        const isValidLocation = Object.values(this.adjacentHexes).map((h) => {
            return h.tileType.land;
        }).includes(true);

        if (this.type === 'edge') {
            const activeNeighbors = Object.values(this.neighbors).map((v) => {
                if (v.active) {
                    return true;
                } else {
                    // check 2nd degree neighbors
                    return Object.values(v.neighbors).map((n) => { return n.active }).includes(true);
                }
            }).includes(true);
            if (!this.active && isValidLocation && activeNeighbors && state.resources.clay >= 5 && state.resources.lumber >= 5) {
                if(apply) { 
                    state.resources.clay -= 5;
                    state.resources.lumber -= 5;
                    this.active = true;
                    this.level = 1;
                }
                return true;
            }
        } else {
            const hasAdjecentRoad = Object.values(this.neighbors).map((v) => {
                if (v.active) {
                    return true;
                } else {
                    return false;
                }
            }).includes(true) || !state.hasInitialSettlement;

            const hasAdjecentSettlement = Object.values(this.neighbors).map((v) => {
                // settlements will always be second degree neighbors
                return Object.values(v.neighbors).map((n) => { return n.active }).includes(true);
            }).includes(true);

            if (this.level === 0 && !this.active) {
                if (hasAdjecentRoad && !hasAdjecentSettlement && isValidLocation && 
                    state.resources.clay >= 5 && state.resources.lumber >= 5 && state.resources.wool >= 5 && state.resources.wheat >= 5) {
                    if(apply) { 
                        state.resources.clay -= 5;
                        state.resources.lumber -= 5;
                        state.resources.wool -= 5;
                        state.resources.wheat -= 5;
                        this.active = true;
                        this.level = 1;
                    }
                    return true;
                }
            } else if (this.level === 1) {
                if (state.resources.lumber >= 10 && state.resources.stone >= 40) {
                    if(apply) {
                        state.resources.lumber -= 10;
                        state.resources.stone -= 40;
                        this.active = true;
                        this.level = 2;
                    }
                    return true;
                }
            }
            return false;
        }
    }
        

    draw() {    
        if(!this.active) {
            return;
        }
        if(this.type === 'vertex') {
            fill(this.color);
            circle(this.x, this.y, 20 * (this.level));
        } else if (this.type === 'edge') {
            var points = []
            Object.values(this.neighbors).forEach((v) => {
                points.push([v.x, v.y]);
            })
            push();
            strokeWeight(6);
            stroke('black');
            line(points[0][0], points[0][1], points[1][0], points[1][1]);
            strokeWeight(5);
            stroke(this.color); 
            line(points[0][0], points[0][1], points[1][0], points[1][1]);
            pop();
        }
    }
}

class Terrain
{
    constructor()
    {
        this.gridSize = gridSize
        this.hexes = {}
        this.buildLocations = {}
        this.width = 5
        this.height = 16
        // terrain is a 2d array of width windowWidth and height windowHeight
        this.terrain = new Array(this.width);
        for (let i = 0; i < this.terrain.length; i++) {
            this.terrain[i] = new Array(this.height).fill(0);
        }
        this.generate();
    }

    setBuildLocation(x, y, type) {
        let index = x * 100 + y;
        if (!this.buildLocations[index]) {
            this.buildLocations[index] = new BuildLocation(x, y, type);
        }
        return this.buildLocations[index];
    }

    setHexLocation(x, y, elevation, richness) {
        let index = x * 100 + y;
        if (!this.hexes[index]) {
            this.hexes[index] = new Hex(x, y, elevation, richness);
        }
        const vertices = this.hexes[index].getVertices();
        vertices.forEach(v => {
            const vertex = this.setBuildLocation(v[0], v[1], 'vertex');
            vertex.adjacentHexes[index] = this.hexes[index];

            // get the edges of the hex
            for (let i = 0; i < 6; i+=1) {
                let x = (vertices[i][0] + vertices[(i + 1)][0]) / 2;
                let y = (vertices[i][1] + vertices[(i + 1)][1]) / 2;
                let location = this.setBuildLocation(x, y, 'edge');
                let v1 = this.setBuildLocation(vertices[i][0], vertices[i][1], 'vertex');
                let v2 = this.setBuildLocation(vertices[i + 1][0], vertices[i + 1][1], 'vertex');
                location.neighbors[v1.index] = v1;
                location.neighbors[v2.index] = v2;
                location.adjacentHexes[index] = this.hexes[index];
                v1.neighbors[location.index] = location;
                v2.neighbors[location.index] = location;
            }

        });
        return this.hexes[index];
    }

    getAllVertexCoords() {
        this.terrain.forEach((row, x) =>
            {
                row.forEach((z) =>
                {
                    z.getVertices().forEach(v => {
                        let x = v[0];
                        let y = v[1];
                      //  this.setBuildLocation(x, y, 'vertex');

                        let vertices = z.getVertices()
                        for (let i = 0; i < 6; i+=2) {
                            let x = (vertices[i][0] + vertices[(i + 1)][0]) / 2;
                            let y = (vertices[i][1] + vertices[(i + 1)][1]) / 2;
                            let location = this.setBuildLocation(x, y, 'edge');
                            let v1 = this.setBuildLocation(vertices[i][0], vertices[i][1], 'vertex');
                            let v2 = this.setBuildLocation(vertices[i + 1][0], vertices[i + 1][1], 'vertex');
                            location.neighbors[v1.index] = v1;
                            location.neighbors[v2.index] = v2;
                            v1.neighbors[location.index] = location;
                            v2.neighbors[location.index] = location;
                        }
                    }
                );
            });
        })
    }


    getAllEdgeCoords() {
        let allVertices = new Set();
        this.terrain.forEach((row, x) =>
            {
                row.forEach((z) =>
                {
                    let vertices = z.getVertices()
                    // find the midpoint of each set of two vertices
                    for (let i = 0; i < 6; i+=2) {
                        let x = (vertices[i][0] + vertices[(i + 1)][0]) / 2;
                        let y = (vertices[i][1] + vertices[(i + 1)][1]) / 2;

                        fill('green');

                        allVertices.add({x, y});
                    }

            });
        });
        // return an array of all vertices
        return Array.from(allVertices);
    }

    getNearestVertex() {
        let allVertices =  Object.values(this.buildLocations);
        let mouse = createVector(mouseX, mouseY);
        let closest = null;
        let minDist = Infinity;

        // get an array of all the values of buildLocations

        allVertices.forEach(v => {
            let dist = p5.Vector.dist(mouse, createVector(v.x, v.y));
            if (dist < minDist) {
                minDist = dist;
                closest = v;
            }
        });

        return closest;
    }


    generate()  {
        //set terrain
        const variation = 15; 
        let xoff = 0;
        for (let x = 0; x < this.terrain.length ; x++)
        {
            let yoff = 0;
            for (let y = 0; y < this.terrain[x].length; y++)
            {
                this.setHexLocation(this.gridSize  + this.gridSize * 3 / 2 * (x) + (this.gridSize * 3 / 4 * (y % 2)) , 
                    this.gridSize  + this.gridSize * (Math.cos(TWO_PI/12)) / 2 * y,
                    map(noise(xoff, yoff), 0, 1, -20, 120), 
                    map(Math.random(), 0, 1, 0, 5)
                );
                yoff += variation;
            }
            xoff += variation;
        }
    }

    draw()
    {
        Object.values(this.hexes).forEach(hex =>
        {
            hex.draw();
        });

        updatePixels();
        let allVertices =  Object.values(this.buildLocations).filter(x => x.active);
        allVertices.filter(x => x.type == 'edge').forEach(v => {
            v.draw();
        });
        allVertices.filter(x => x.type == 'vertex').forEach(v => {
            v.draw();
        });

    }   
}

class Trade {
    constructor() {
        // choose a random resouece from tileTypes but only if it is land
        let resources = tileTypes.filter(x => x.land);
        let randomIndex = Math.floor(Math.random() * resources.length);
        // choose a different random resource
        let randomIndex2 = randomIndex
        while (randomIndex === randomIndex2) {
            randomIndex2 = Math.floor(Math.random() * resources.length);
        }
        this.have = resources[randomIndex].name;
        this.need = resources[randomIndex2].name;
        // rate is random 2 to 4
        this.rate = Math.floor(Math.random() * 2) + 2;
    }

    toString() {
        return "Trade " + this.rate + " " + this.have + " for 1 " + this.need;
    }

    onClick() {
        // if player has the resources
        if (state.resources[this.want] >= this.rate) {
            state.resources[this.want] -= this.rate;
            state.resources[this.need] += this.rate;
        }
    }
}