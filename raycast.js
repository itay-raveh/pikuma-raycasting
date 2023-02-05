/// <reference path="/home/vscode/.vscode-remote/extensions/samplavigne.p5-vscode-1.2.13/p5types/global.d.ts"/>

const RAD = Math.PI / 180;

const TILE_SIZE = 60;

const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HALF_WIDTH = WINDOW_WIDTH / 2;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;
const WINDOW_HALF_HEIGHT = WINDOW_HEIGHT / 2;

const FOV = 60 * RAD;
const RAY_WIDTH = 1;
const RAY_COUNT = WINDOW_WIDTH / RAY_WIDTH;

const DISTANCE_TO_PROJECTION = WINDOW_HALF_WIDTH / Math.tan(FOV / 2);

const MINIMAP_SCALE = 0.2;

const DARK = "#222";
const LIGHT = "#fff";

function pixels2index(p) {
  return Math.floor(p / TILE_SIZE);
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
      !!grid.grid[pixels2index(position.y)][pixels2index(position.x)]
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
    this.angle = 90 * RAD;
    this.moveSpeed = 3;
    this.rotationSpeed = 10;
  }

  update() {
    const step = p5.Vector.mult(this.positionOffset, this.moveSpeed);
    const tangentAngle = this.angle - radians(90);

    const move = createVector(
      Math.cos(this.angle) * step.y + Math.cos(tangentAngle) * step.x,
      Math.sin(this.angle) * step.y + Math.sin(tangentAngle) * step.x
    );
    const position = p5.Vector.add(this.position, move);

    if (!grid.hasWallAt(position)) this.position = position;
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

    this.hit = createVector(0, 0);
    this.distance = 0;
    this.isHitVer = false;

    this.isFacingDown = this.angle > 0 && this.angle < Math.PI;
    this.isFacingRight =
      this.angle > 1.5 * Math.PI || this.angle < 0.5 * Math.PI;
  }

  cast() {
    const intercept = createVector(0, 0);
    const step = createVector(0, 0);

    intercept.y = Math.floor(player.position.y / TILE_SIZE) * TILE_SIZE;
    intercept.y += this.isFacingDown ? TILE_SIZE : 0;
    intercept.x =
      player.position.x +
      (intercept.y - player.position.y) / Math.tan(this.angle);
    step.y = TILE_SIZE;
    step.y *= this.isFacingDown ? 1 : -1;
    step.x = TILE_SIZE / Math.tan(this.angle);
    step.x *= !this.isFacingRight && step.x > 0 ? -1 : 1;
    step.x *= this.isFacingRight && step.x < 0 ? -1 : 1;

    const next = intercept.copy();

    let foundHor = false;
    const hor = createVector(0, 0);
    while (isInWindow(next)) {
      if (
        grid.hasWallAt(
          createVector(next.x, next.y - (this.isFacingDown ? 0 : 1))
        )
      ) {
        foundHor = true;
        hor.set(next);
        break;
      }

      next.add(step);
    }

    intercept.x = Math.floor(player.position.x / TILE_SIZE) * TILE_SIZE;
    intercept.x += this.isFacingRight ? TILE_SIZE : 0;
    intercept.y =
      player.position.y +
      (intercept.x - player.position.x) * Math.tan(this.angle);
    step.x = TILE_SIZE;
    step.x *= this.isFacingRight ? 1 : -1;
    step.y = TILE_SIZE * Math.tan(this.angle);
    step.y *= !this.isFacingDown && step.y > 0 ? -1 : 1;
    step.y *= this.isFacingDown && step.y < 0 ? -1 : 1;

    next.set(intercept);

    let foundVer = false;
    const ver = createVector(0, 0);
    while (isInWindow(next)) {
      if (
        grid.hasWallAt(
          createVector(next.x - (this.isFacingRight ? 0 : 1), next.y)
        )
      ) {
        foundVer = true;
        ver.set(next);
        break;
      }

      next.add(step);
    }

    const horDist = !foundHor ? Number.MAX_VALUE : player.position.dist(hor);

    const verDist = !foundVer ? Number.MAX_VALUE : player.position.dist(ver);

    this.hit = horDist < verDist ? hor : ver;
    this.distance = Math.min(horDist, verDist);
    this.isHitVer = verDist < horDist;
  }

  draw() {
    stroke("red");
    line(
      MINIMAP_SCALE * player.position.x,
      MINIMAP_SCALE * player.position.y,
      MINIMAP_SCALE * this.hit.x,
      MINIMAP_SCALE * this.hit.y
    );
  }
}

/** @type {Grid} */
let grid;
/** @type {Player} */
let player;
/** @type {Ray[]} */
let rays = [];

function keyPressed() {
  switch (key) {
    case "w":
      player.positionOffset.y += 1;
      break;
    case "s":
      player.positionOffset.y -= 1;
      break;
    case "a":
      player.positionOffset.x += 1;
      break;
    case "d":
      player.positionOffset.x -= 1;
      break;
  }
}

function keyReleased() {
  switch (key) {
    case "w":
      player.positionOffset.y -= 1;
      break;
    case "s":
      player.positionOffset.y += 1;
      break;
    case "a":
      player.positionOffset.x -= 1;
      break;
    case "d":
      player.positionOffset.x += 1;
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
    player.angle += ((mouseX - pmouseX) * player.rotationSpeed) / windowWidth;
}

function castAllRays() {
  let angle = player.angle - FOV / 2;

  rays = [];

  for (let i = 0; i < RAY_COUNT; i++) {
    const ray = new Ray(angle);
    ray.cast();
    rays.push(ray);
    angle += FOV / RAY_COUNT;
  }
}

function drawWalls() {
  for (const i in rays) {
    const ray = rays[i];
    const distance = ray.distance * Math.cos(ray.angle - player.angle);
    const wallStripHeight = (TILE_SIZE / distance) * DISTANCE_TO_PROJECTION;

    const b = Math.round(
      255 - (distance * 150) / DISTANCE_TO_PROJECTION + (ray.isHitVer ? 50 : 0)
    );
    fill("black");
    rect(
      i * RAY_WIDTH,
      WINDOW_HALF_HEIGHT - wallStripHeight / 2 - 1,
      RAY_WIDTH,
      wallStripHeight + 2
    );
    if (i > 0 && ray.isHitVer !== rays[i - 1].isHitVer) fill("black");
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
  textAlign(CENTER, CENTER);
  grid = new Grid();
  player = new Player();
}

function update() {
  player.update();
  castAllRays();
}

function draw() {
  update();

  clear(DARK);

  fill(LIGHT);
  rect(0, WINDOW_HALF_HEIGHT, WINDOW_WIDTH, WINDOW_HALF_HEIGHT);

  drawWalls();

  fill("black");
  rectMode(CENTER);
  rect(WINDOW_HALF_WIDTH, WINDOW_HALF_HEIGHT, 1, 10);
  rect(WINDOW_HALF_WIDTH, WINDOW_HALF_HEIGHT, 10, 1);
  rectMode(CORNER);

  // minimap
  grid.draw();
  for (const ray of rays) ray.draw();
  player.draw();
}
