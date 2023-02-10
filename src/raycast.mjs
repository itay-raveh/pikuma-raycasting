/// <reference path="/home/vscode/.vscode-remote/extensions/samplavigne.p5-vscode-1.2.13/p5types/global.d.ts"/>
import {
  DARK,
  FOV,
  FOV_HALF,
  LIGHT,
  RAY_COUNT,
  RAY_WIDTH,
  TILE_SIZE,
  WINDOW_HALF_HEIGHT,
  WINDOW_HALF_WIDTH,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from "./consts.mjs";
import { Grid } from "./grid.mjs";
import { Player } from "./player.mjs";
import { Ray } from "./ray.mjs";

export const DISTANCE_TO_PROJECTION = WINDOW_HALF_WIDTH / tan(FOV_HALF);

const _2PI = 2 * PI;

const GRID = new Grid();
const PLAYER = new Player(GRID);
let RAYS = [];

window.keyPressed = function () {
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
};

window.keyReleased = function () {
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
};

window.mouseMoved = function () {
  if (
    mouseY > 0 &&
    mouseY < WINDOW_HEIGHT &&
    mouseX > 0 &&
    mouseX < WINDOW_WIDTH
  )
    PLAYER.angle += ((mouseX - pmouseX) * PLAYER.rotationSpeed) / windowWidth;
};

function normAngle(angle) {
  return ((angle % _2PI) + _2PI) % _2PI;
}

function castAllRays() {
  let angle = PLAYER.angle - FOV_HALF;

  RAYS = [];

  for (let i = 0; i < RAY_COUNT; i++) {
    const ray = new Ray(normAngle(angle), GRID, PLAYER);
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

window.setup = function () {
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
};

function update() {
  PLAYER.update();
  castAllRays();
}

window.draw = function () {
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
};
