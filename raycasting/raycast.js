const RAD = Math.PI / 180;

const TILE_SIZE = 50;
const HALF_TILE = TILE_SIZE / 2;
const QUARTER_TILE = HALF_TILE / 2;

const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV = 60 * RAD;
const RAY_LEN = TILE_SIZE;
const RAY_WIDTH = 10;
const RAY_COUNT = WINDOW_WIDTH / RAY_WIDTH;

const DARK = "#222";
const LIGHT = "#fff";

let SHOW_INDICES = false;
let SHOW_COORDS = false;
let SHOW_GRID = false;

function pixels2index(p) {
  return Math.floor(p / TILE_SIZE);
}

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

  hasWallAt(x, y) {
    return (
      x < 0 ||
      x > WINDOW_WIDTH ||
      y < 0 ||
      y > WINDOW_HEIGHT ||
      !!grid.grid[pixels2index(y)][pixels2index(x)]
    );
  }

  draw() {
    for (const i in this.grid) {
      for (const j in this.grid[i]) {
        const x = j * TILE_SIZE;
        const y = i * TILE_SIZE;

        if (SHOW_GRID) stroke(DARK);
        else noStroke();

        fill(this.grid[i][j] ? DARK : LIGHT);
        rect(x, y, TILE_SIZE, TILE_SIZE);

        if (SHOW_INDICES || SHOW_COORDS) {
          noStroke();
          fill("grey");

          const tx = x + HALF_TILE;
          const ty = y + HALF_TILE;

          if (SHOW_INDICES) text(`${j},${i}`, tx, ty + QUARTER_TILE);

          if (SHOW_COORDS) text(`${x},${y}`, tx, ty - QUARTER_TILE);
        }
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
    this.angle = 90 * RAD;
    this.moveSpeed = 3;
    this.rotationSpeed = 3 * RAD;
  }

  update() {
    const step = this.walkOffset * this.moveSpeed;

    const x = this.x + Math.cos(this.angle) * step;
    const y = this.y + Math.sin(this.angle) * step;

    if (!grid.hasWallAt(x, y)) {
      this.x = x;
      this.y = y;
    }

    this.angle += this.turnOffset * this.rotationSpeed;
  }

  draw() {
    noStroke();
    fill("red");
    circle(this.x, this.y, this.radius);

    if (SHOW_INDICES || SHOW_COORDS) {
      if (SHOW_INDICES)
        text(
          `${pixels2index(this.x)},${pixels2index(this.y)}`,
          this.x,
          this.y + QUARTER_TILE
        );

      if (SHOW_COORDS)
        text(
          `${Math.round(this.x) - HALF_TILE},${Math.round(this.y) - HALF_TILE}`,
          this.x,
          this.y - QUARTER_TILE
        );
    }
  }
}

class Ray {
  constructor(angle) {
    this.angle = angle;
  }
  draw() {
    stroke("rgba(255,0, 0, 0.3)");
    line(
      player.x,
      player.y,
      player.x + Math.cos(this.angle) * RAY_LEN,
      player.y + Math.sin(this.angle) * RAY_LEN
    );
  }
}

const grid = new Map();
const player = new Player();
let rays = [];

function keyPressed() {
  switch (keyCode) {
    case UP_ARROW:
      player.walkOffset += 1;
      break;
    case DOWN_ARROW:
      player.walkOffset -= 1;
      break;
    case RIGHT_ARROW:
      player.turnOffset += 1;
      break;
    case LEFT_ARROW:
      player.turnOffset -= 1;
      break;
  }
}

function keyTyped() {
  switch (key) {
    case "g":
    case "G":
      SHOW_GRID = !SHOW_GRID;
      break;
    case "i":
    case "I":
      SHOW_INDICES = !SHOW_INDICES;
      break;
    case "c":
    case "C":
      SHOW_COORDS = !SHOW_COORDS;
      break;
  }
}

function keyReleased() {
  switch (keyCode) {
    case UP_ARROW:
      player.walkOffset -= 1;
      break;
    case DOWN_ARROW:
      player.walkOffset += 1;
      break;
    case RIGHT_ARROW:
      player.turnOffset -= 1;
      break;
    case LEFT_ARROW:
      player.turnOffset += 1;
      break;
  }
}

function castAllRays() {
  let col = 0;
  let angle = player.angle - FOV / 2;

  rays = [];

  for (let i = 0; i < RAY_COUNT; i++) {
    const ray = new Ray(angle);
    rays.push(ray);
    angle += FOV / RAY_COUNT;
    col++;
  }
}

function setup() {
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
  textAlign(CENTER, CENTER);
}

function update() {
  player.update();
  castAllRays();
}

function draw() {
  update();
  grid.draw();
  for (const ray of rays) ray.draw();
  player.draw();
}
