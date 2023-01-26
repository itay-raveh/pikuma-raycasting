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
const RAY_WIDTH = 1;
const RAY_COUNT = WINDOW_WIDTH / RAY_WIDTH;

const MINIMAP_SCALE = 0.2;

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
        rect(
          MINIMAP_SCALE * x,
          MINIMAP_SCALE * y,
          MINIMAP_SCALE * TILE_SIZE,
          MINIMAP_SCALE * TILE_SIZE
        );
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
    circle(
      MINIMAP_SCALE * this.x,
      MINIMAP_SCALE * this.y,
      MINIMAP_SCALE * this.radius
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

function normalizeAngle(angle) {
  angle = angle % (2 * Math.PI);
  if (angle < 0) {
    angle += 2 * Math.PI;
  }
  return angle;
}

class Ray {
  constructor(angle) {
    this.angle = normalizeAngle(angle);

    this.hitX = 0;
    this.hitY = 0;
    this.distance = 0;
    this.isHitVer = false;

    this.isFacingDown = this.angle > 0 && this.angle < Math.PI;
    this.isFacingRight =
      this.angle > 1.5 * Math.PI || this.angle < 0.5 * Math.PI;
  }

  cast(col) {
    let xintercept, yintercept, xstep, ystep;

    yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
    yintercept += this.isFacingDown ? TILE_SIZE : 0;
    xintercept = player.x + (yintercept - player.y) / Math.tan(this.angle);
    ystep = TILE_SIZE;
    ystep *= this.isFacingDown ? 1 : -1;
    xstep = TILE_SIZE / Math.tan(this.angle);
    xstep *= !this.isFacingRight && xstep > 0 ? -1 : 1;
    xstep *= this.isFacingRight && xstep < 0 ? -1 : 1;

    let nextX = xintercept;
    let nextY = yintercept;

    let foundHor = false;
    let horX = 0;
    let horY = 0;
    while (
      nextX >= 0 &&
      nextX <= WINDOW_WIDTH &&
      nextY >= 0 &&
      nextY <= WINDOW_HEIGHT
    ) {
      if (grid.hasWallAt(nextX, nextY - (this.isFacingDown ? 0 : 1))) {
        foundHor = true;
        horX = nextX;
        horY = nextY;
        break;
      }

      nextX += xstep;
      nextY += ystep;
    }

    xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
    xintercept += this.isFacingRight ? TILE_SIZE : 0;
    yintercept = player.y + (xintercept - player.x) * Math.tan(this.angle);
    xstep = TILE_SIZE;
    xstep *= this.isFacingRight ? 1 : -1;
    ystep = TILE_SIZE * Math.tan(this.angle);
    ystep *= !this.isFacingDown && ystep > 0 ? -1 : 1;
    ystep *= this.isFacingDown && ystep < 0 ? -1 : 1;

    nextX = xintercept;
    nextY = yintercept;

    let foundVer = false;
    let verX = 0;
    let verY = 0;
    while (
      nextX >= 0 &&
      nextX <= WINDOW_WIDTH &&
      nextY >= 0 &&
      nextY <= WINDOW_HEIGHT
    ) {
      if (grid.hasWallAt(nextX - (this.isFacingRight ? 0 : 1), nextY)) {
        foundVer = true;
        verX = nextX;
        verY = nextY;
        break;
      }

      nextX += xstep;
      nextY += ystep;
    }

    const horDist = !foundHor
      ? Number.MAX_VALUE
      : dist(player.x, player.y, horX, horY);

    const verDist = !foundVer
      ? Number.MAX_VALUE
      : dist(player.x, player.y, verX, verY);

    this.hitX = horDist < verDist ? horX : verX;
    this.hitY = horDist < verDist ? horY : verY;
    this.distance = Math.min(horDist, verDist);
    this.isHitVer = verDist < horDist;
  }

  draw() {
    stroke("red");
    line(
      MINIMAP_SCALE * player.x,
      MINIMAP_SCALE * player.y,
      MINIMAP_SCALE * this.hitX,
      MINIMAP_SCALE * this.hitY
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
  let angle = player.angle - FOV / 2;

  rays = [];

  for (let i = 0; i < RAY_COUNT; i++) {
    const ray = new Ray(angle);
    ray.cast(i);
    rays.push(ray);
    angle += FOV / RAY_COUNT;
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
