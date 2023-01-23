const TILE_SIZE = 50;
const HALF_TILE = TILE_SIZE / 2;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const RAY_LEN = 50;

const DARK = "#222";
const LIGHT = "#fff";

let SHOW_INDICES = false;
let SHOW_COORDS = false;
let SHOW_GRID = true;

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

          if (SHOW_INDICES) text(`${j},${i}`, tx, ty);
          if (SHOW_COORDS) text(`${x},${y}`, tx, ty);
        }
      }
    }
  }
}

function pixels2index(p) {
  return Math.round((p - HALF_TILE) / TILE_SIZE);
}

class Player {
  constructor() {
    this.x = WINDOW_WIDTH / 2;
    this.y = WINDOW_HEIGHT / 2;
    this.radius = 5;

    this.turnOffset = 0;
    this.walkOffset = 0;
    this.angle = Math.PI / 2;
    this.moveSpeed = 3;
    this.rotationSpeed = 3 * (Math.PI / 180);
  }

  update() {
    const step = this.walkOffset * this.moveSpeed;

    const x = this.x + Math.cos(this.angle) * step;
    const y = this.y + Math.sin(this.angle) * step;

    if (!grid.grid[pixels2index(y)][pixels2index(x)]) {
      this.x = x;
      this.y = y;
    }

    this.angle += this.turnOffset * this.rotationSpeed;
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

    if (SHOW_INDICES || SHOW_COORDS) {
      const tx = this.x + HALF_TILE / 2;
      const ty = this.y + HALF_TILE / 2;

      if (SHOW_INDICES)
        text(`${pixels2index(this.y)},${pixels2index(this.x)}`, tx, ty);
      if (SHOW_COORDS)
        text(`${Math.round(this.y)},${Math.round(this.x)}`, tx, ty);
    }
  }
}

const grid = new Map();
const player = new Player();

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
    default:
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
    default:
      break;
  }
}

function setup() {
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
  textAlign(CENTER, CENTER);
}

function update() {
  player.update();
}

function draw() {
  update();
  grid.draw();
  player.draw();
}
