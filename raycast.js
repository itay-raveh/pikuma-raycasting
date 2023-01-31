/// <reference path="/home/vscode/.vscode-remote/extensions/samplavigne.p5-vscode-1.2.13/p5types/global.d.ts"/>

const RAD = Math.PI / 180;

const TILE_SIZE = 60;
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

const DISTANCE_TO_PROJECTION = WINDOW_WIDTH / 2 / Math.tan(FOV / 2);

const MINIMAP_SCALE = 0.2;

const DARK = "#222";
const LIGHT = "#fff";

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
    this.x = WINDOW_WIDTH / 2;
    this.y = WINDOW_HEIGHT / 2;
    this.radius = 5;

    this.forwardWalkOffset = 0;
    this.leftwardWalkOffset = 0;
    this.angle = 90 * RAD;
    this.moveSpeed = 3;
    this.rotationSpeed = 10;
  }

  update() {
    const forwardStep = this.forwardWalkOffset * this.moveSpeed;
    const leftStep = this.leftwardWalkOffset * this.moveSpeed;
    const tangentAngle = this.angle - radians(90);

    const x =
      this.x +
      Math.cos(this.angle) * forwardStep +
      Math.cos(tangentAngle) * leftStep;
    const y =
      this.y +
      Math.sin(this.angle) * forwardStep +
      Math.sin(tangentAngle) * leftStep;

    if (!grid.hasWallAt(x, y)) {
      this.x = x;
      this.y = y;
    }
  }

  draw() {
    noStroke();
    fill("red");
    circle(
      MINIMAP_SCALE * this.x,
      MINIMAP_SCALE * this.y,
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

    this.hitX = 0;
    this.hitY = 0;
    this.distance = 0;
    this.isHitVer = false;

    this.isFacingDown = this.angle > 0 && this.angle < Math.PI;
    this.isFacingRight =
      this.angle > 1.5 * Math.PI || this.angle < 0.5 * Math.PI;
  }

  cast() {
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
  switch (key) {
    case "w":
      player.forwardWalkOffset += 1;
      break;
    case "s":
      player.forwardWalkOffset -= 1;
      break;
    case "a":
      player.leftwardWalkOffset += 1;
      break;
    case "d":
      player.leftwardWalkOffset -= 1;
      break;
  }
}

function keyReleased() {
  switch (key) {
    case "w":
      player.forwardWalkOffset -= 1;
      break;
    case "s":
      player.forwardWalkOffset += 1;
      break;
    case "a":
      player.leftwardWalkOffset -= 1;
      break;
    case "d":
      player.leftwardWalkOffset += 1;
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
      WINDOW_HEIGHT / 2 - wallStripHeight / 2 - 1,
      RAY_WIDTH,
      wallStripHeight + 2
    );
    if (i > 0 && ray.isHitVer !== rays[i - 1].isHitVer) fill("black");
    else fill(`rgb(${b},${b},${b})`);
    noStroke();
    rect(
      i * RAY_WIDTH,
      WINDOW_HEIGHT / 2 - wallStripHeight / 2,
      RAY_WIDTH,
      wallStripHeight
    );
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

  clear(DARK);

  fill(LIGHT);
  rect(0, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT / 2);

  drawWalls();

  fill("black");
  rectMode(CENTER);
  rect(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 1, 10);
  rect(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 10, 1);
  rectMode(CORNER);

  // minimap
  grid.draw();
  for (const ray of rays) ray.draw();
  player.draw();
}