const TILE_SIZE = 50;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const RAY_LEN = 50;

const DARK = "#222";
const LIGHT = "#fff";

class Map {
  constructor() {
    this.grid = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
  }

  draw() {
    stroke(DARK);
    for (const i in this.grid) {
      for (const j in this.grid[i]) {
        const x = j * TILE_SIZE;
        const y = i * TILE_SIZE;

        fill(this.grid[i][j] ? DARK : LIGHT);
        rect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

class Player {
  constructor() {
    this.x = WINDOW_WIDTH / 2;
    this.y = WINDOW_HEIGHT / 2;
    this.radius = 5;

    this.turnOffset = 0;
    this.walkOffset = 0;
    this.angle = Math.PI / 2;
    this.moveSpeed = 2.0;
    this.rotationSpeed = 2 * (Math.PI / 180);
  }

  update() {
    // TODO
  }

  draw() {
    noStroke();
    fill("red");
    circle(this.x, this.y, this.radius);
    stroke("red");
    line(
      this.x,
      this.y,
      this.x + Math.cos(this.angle) * RAY_LEN,
      this.y + Math.sin(this.angle) * RAY_LEN
    );
  }
}

const grid = new Map();
const player = new Player();

function setup() {
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
  player.update();
}

function draw() {
  update();
  grid.draw();
  player.draw();
}
