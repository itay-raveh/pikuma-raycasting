/// <reference path="/home/vscode/.vscode-remote/extensions/samplavigne.p5-vscode-1.2.13/p5types/global.d.ts"/>

// Load `p5` members to globa scope
new p5();

const TILE_SIZE = 60;

const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HALF_WIDTH = WINDOW_WIDTH / 2;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;
const WINDOW_HALF_HEIGHT = WINDOW_HEIGHT / 2;

const FOV = radians(60);
const FOV_HALF = FOV / 2;
const RAY_WIDTH = 1;
const RAY_COUNT = WINDOW_WIDTH / RAY_WIDTH;

const DEG90 = radians(90);

const DISTANCE_TO_PROJECTION = WINDOW_HALF_WIDTH / tan(FOV_HALF);

const MINIMAP_SCALE = 0.2;

const DARK = "#222";
const LIGHT = "#fff";

function pixels2index(p) {
  return floor(p / TILE_SIZE);
}

function isInWindow(position) {
  return (
    position.x >= 0 &&
    position.x <= WINDOW_WIDTH &&
    position.y >= 0 &&
    position.y <= WINDOW_HEIGHT
  );
}

class Grid {
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

  /**
   * Check if a wall exists at some pixel position.
   *
   * @param {ReturnType<typeof createVector>} position
   */
  hasWallAt(position) {
    return (
      !isInWindow(position) ||
      !!GRID.grid[pixels2index(position.y)][pixels2index(position.x)]
    );
  }

  draw() {
    for (const i in this.grid) {
      for (const j in this.grid[i]) {
        const x = j * TILE_SIZE;
        const y = i * TILE_SIZE;

        stroke(DARK);

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
    this.position = createVector(WINDOW_HALF_WIDTH, WINDOW_HALF_HEIGHT);
    this.positionOffset = createVector(0, 0);

    this.radius = 5;
    this.angle = DEG90;
    this.moveSpeed = 3;
    this.rotationSpeed = 10;
  }

  update() {
    const step = p5.Vector.mult(this.positionOffset, this.moveSpeed);
    const tangentAngle = this.angle - DEG90;

    const move = createVector(
      cos(this.angle) * step.y + cos(tangentAngle) * step.x,
      sin(this.angle) * step.y + sin(tangentAngle) * step.x
    );
    const position = p5.Vector.add(this.position, move);

    if (!GRID.hasWallAt(position)) this.position = position;
  }

  draw() {
    noStroke();
    fill("red");
    circle(
      MINIMAP_SCALE * this.position.x,
      MINIMAP_SCALE * this.position.y,
      MINIMAP_SCALE * this.radius
    );
  }
}

class Ray {
  constructor(angle) {
    this.angle = angle % (2 * PI);
    this.hit = createVector(0, 0);
    this.distance = 0;
    this.isHitVer = false;
    this.isFacingDown = this.angle > 0 && this.angle < PI;
    this.isFacingRight = this.angle > 1.5 * PI || this.angle < 0.5 * PI;
  }

  cast() {
    const intercept = createVector(0, 0);
    const step = createVector(0, 0);

    intercept.y = floor(PLAYER.position.y / TILE_SIZE) * TILE_SIZE;
    intercept.y += this.isFacingDown ? TILE_SIZE : 0;
    intercept.x =
      PLAYER.position.x + (intercept.y - PLAYER.position.y) / tan(this.angle);
    step.y = TILE_SIZE;
    step.y *= this.isFacingDown ? 1 : -1;
    step.x = TILE_SIZE / tan(this.angle);
    step.x *= !this.isFacingRight && step.x > 0 ? -1 : 1;
    step.x *= this.isFacingRight && step.x < 0 ? -1 : 1;

    const next = intercept.copy();

    let foundHor = false;
    const hor = createVector(0, 0);
    while (isInWindow(next)) {
      if (
        GRID.hasWallAt(
          createVector(next.x, next.y - (this.isFacingDown ? 0 : 1))
        )
      ) {
        foundHor = true;
        hor.set(next);
        break;
      }

      next.add(step);
    }

    intercept.x = floor(PLAYER.position.x / TILE_SIZE) * TILE_SIZE;
    intercept.x += this.isFacingRight ? TILE_SIZE : 0;
    intercept.y =
      PLAYER.position.y + (intercept.x - PLAYER.position.x) * tan(this.angle);
    step.x = TILE_SIZE;
    step.x *= this.isFacingRight ? 1 : -1;
    step.y = TILE_SIZE * tan(this.angle);
    step.y *= !this.isFacingDown && step.y > 0 ? -1 : 1;
    step.y *= this.isFacingDown && step.y < 0 ? -1 : 1;

    next.set(intercept);

    let foundVer = false;
    const ver = createVector(0, 0);
    while (isInWindow(next)) {
      if (
        GRID.hasWallAt(
          createVector(next.x - (this.isFacingRight ? 0 : 1), next.y)
        )
      ) {
        foundVer = true;
        ver.set(next);
        break;
      }

      next.add(step);
    }

    const horDist = !foundHor ? Number.MAX_VALUE : PLAYER.position.dist(hor);

    const verDist = !foundVer ? Number.MAX_VALUE : PLAYER.position.dist(ver);

    this.hit = horDist < verDist ? hor : ver;
    this.distance = min(horDist, verDist);
    this.isHitVer = verDist < horDist;
  }

  draw() {
    stroke("red");
    line(
      MINIMAP_SCALE * PLAYER.position.x,
      MINIMAP_SCALE * PLAYER.position.y,
      MINIMAP_SCALE * this.hit.x,
      MINIMAP_SCALE * this.hit.y
    );
  }
}

const GRID = new Grid();
const PLAYER = new Player();
let RAYS = [];

function keyPressed() {
  switch (key) {
    case "w":
      PLAYER.positionOffset.y += 1;
      break;
    case "s":
      PLAYER.positionOffset.y -= 1;
      break;
    case "a":
      PLAYER.positionOffset.x += 1;
      break;
    case "d":
      PLAYER.positionOffset.x -= 1;
      break;
  }
}

function keyReleased() {
  switch (key) {
    case "w":
      PLAYER.positionOffset.y -= 1;
      break;
    case "s":
      PLAYER.positionOffset.y += 1;
      break;
    case "a":
      PLAYER.positionOffset.x -= 1;
      break;
    case "d":
      PLAYER.positionOffset.x += 1;
      break;
  }
}

function mouseMoved() {
  if (
    mouseY > 0 &&
    mouseY < WINDOW_HEIGHT &&
    mouseX > 0 &&
    mouseX < WINDOW_WIDTH
  )
    PLAYER.angle += ((mouseX - pmouseX) * PLAYER.rotationSpeed) / windowWidth;
}

function castAllRays() {
  let angle = PLAYER.angle - FOV_HALF;

  RAYS = [];

  for (let i = 0; i < RAY_COUNT; i++) {
    const ray = new Ray(angle);
    ray.cast();
    RAYS.push(ray);
    angle += FOV / RAY_COUNT;
  }
}

function drawWalls() {
  for (const i in RAYS) {
    const ray = RAYS[i];
    const distance = ray.distance * cos(ray.angle - PLAYER.angle);
    const wallStripHeight = (TILE_SIZE / distance) * DISTANCE_TO_PROJECTION;

    const b = round(
      255 - (distance * 150) / DISTANCE_TO_PROJECTION + (ray.isHitVer ? 50 : 0)
    );
    fill(DARK);
    rect(
      i * RAY_WIDTH,
      WINDOW_HALF_HEIGHT - wallStripHeight / 2 - 1,
      RAY_WIDTH,
      wallStripHeight + 2
    );
    if (i > 0 && ray.isHitVer !== RAYS[i - 1].isHitVer) fill(DARK);
    else fill(`rgb(${b},${b},${b})`);
    noStroke();
    rect(
      i * RAY_WIDTH,
      WINDOW_HALF_HEIGHT - wallStripHeight / 2,
      RAY_WIDTH,
      wallStripHeight
    );
  }
}

function setup() {
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
  PLAYER.update();
  castAllRays();
}

function draw() {
  update();

  clear(DARK);

  fill(LIGHT);
  rect(0, WINDOW_HALF_HEIGHT, WINDOW_WIDTH, WINDOW_HALF_HEIGHT);

  drawWalls();

  fill(DARK);
  rectMode(CENTER);
  rect(WINDOW_HALF_WIDTH, WINDOW_HALF_HEIGHT, 1, 10);
  rect(WINDOW_HALF_WIDTH, WINDOW_HALF_HEIGHT, 10, 1);
  rectMode(CORNER);

  // minimap
  GRID.draw();
  for (const ray of RAYS) ray.draw();
  PLAYER.draw();
}
