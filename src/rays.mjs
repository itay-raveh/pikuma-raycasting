/// <reference path="/home/vscode/.vscode-remote/extensions/samplavigne.p5-vscode-1.2.13/p5types/global.d.ts"/>
import {
  FOV,
  FOV_HALF,
  MINIMAP_SCALE,
  RAY_COUNT,
  TILE_SIZE,
} from "./consts.mjs";
import { isInWindow } from "./grid.mjs";

class Ray {
  constructor(angle, grid, player) {
    this.grid = grid;
    this.player = player;

    this.angle = angle;
    this.hit = createVector(0, 0);
    this.distance = 0;
    this.isHitVer = false;
    this.isFacingDown = this.angle > 0 && this.angle < PI;
    this.isFacingRight = this.angle > 1.5 * PI || this.angle < 0.5 * PI;
  }

  cast() {
    const intercept = createVector(0, 0);
    const step = createVector(0, 0);

    intercept.y = floor(this.player.position.y / TILE_SIZE) * TILE_SIZE;
    intercept.y += this.isFacingDown ? TILE_SIZE : 0;
    intercept.x =
      this.player.position.x +
      (intercept.y - this.player.position.y) / tan(this.angle);
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
        this.grid.hasWallAt(
          createVector(next.x, next.y - (this.isFacingDown ? 0 : 1))
        )
      ) {
        foundHor = true;
        hor.set(next);
        break;
      }

      next.add(step);
    }

    intercept.x = floor(this.player.position.x / TILE_SIZE) * TILE_SIZE;
    intercept.x += this.isFacingRight ? TILE_SIZE : 0;
    intercept.y =
      this.player.position.y +
      (intercept.x - this.player.position.x) * tan(this.angle);
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
        this.grid.hasWallAt(
          createVector(next.x - (this.isFacingRight ? 0 : 1), next.y)
        )
      ) {
        foundVer = true;
        ver.set(next);
        break;
      }

      next.add(step);
    }

    const horDist = !foundHor
      ? Number.MAX_VALUE
      : this.player.position.dist(hor);

    const verDist = !foundVer
      ? Number.MAX_VALUE
      : this.player.position.dist(ver);

    this.hit = horDist < verDist ? hor : ver;
    this.distance = min(horDist, verDist);
    this.isHitVer = verDist < horDist;
  }

  draw() {
    stroke("red");
    line(
      MINIMAP_SCALE * this.player.position.x,
      MINIMAP_SCALE * this.player.position.y,
      MINIMAP_SCALE * this.hit.x,
      MINIMAP_SCALE * this.hit.y
    );
  }
}

function normAngle(angle) {
  return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}

export class Rays {
  constructor(grid, player) {
    this.grid = grid;
    this.player = player;
    this.rays = [];
  }

  update() {
    let angle = this.player.angle - FOV_HALF;

    this.rays = [];

    for (let i = 0; i < RAY_COUNT; i++) {
      const ray = new Ray(normAngle(angle), this.grid, this.player);
      ray.cast();
      this.rays.push(ray);
      angle += FOV / RAY_COUNT;
    }
  }

  draw() {
    this.rays.forEach((ray) => ray.draw());
  }
}
