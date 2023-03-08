/// <reference path="/home/codespace/.vscode-remote/extensions/samplavigne.p5-vscode-1.2.13/p5types/global.d.ts"/>
import {
  FOV,
  MINIMAP_SCALE,
  RAY_WIDTH,
  TILE_SIZE,
  WINDOW_WIDTH,
} from "./consts.mjs";
import { isInWindow } from "./grid.mjs";

class Ray {
  constructor(grid, player) {
    this.grid = grid;
    this.player = player;
  }

  cast(angle) {
    this.angle = normAngle(angle);
    const isFacingDown = this.angle > 0 && this.angle < PI;
    const isFacingRight = this.angle > PI + HALF_PI || this.angle < HALF_PI;

    const intercept = createVector(0, 0);
    const step = createVector(0, 0);

    intercept.y = floor(this.player.position.y / TILE_SIZE) * TILE_SIZE;
    intercept.y += isFacingDown ? TILE_SIZE : 0;
    intercept.x =
      this.player.position.x +
      (intercept.y - this.player.position.y) / tan(this.angle);
    step.y = TILE_SIZE;
    step.y *= isFacingDown ? 1 : -1;
    step.x = TILE_SIZE / tan(this.angle);
    step.x *= !isFacingRight && step.x > 0 ? -1 : 1;
    step.x *= isFacingRight && step.x < 0 ? -1 : 1;

    const next = intercept.copy();

    let foundHor = false;
    const hor = createVector(0, 0);
    while (isInWindow(next)) {
      if (
        this.grid.hasWallAt(
          createVector(next.x, next.y - (isFacingDown ? 0 : 1))
        )
      ) {
        foundHor = true;
        hor.set(next);
        break;
      }

      next.add(step);
    }

    intercept.x = floor(this.player.position.x / TILE_SIZE) * TILE_SIZE;
    intercept.x += isFacingRight ? TILE_SIZE : 0;
    intercept.y =
      this.player.position.y +
      (intercept.x - this.player.position.x) * tan(this.angle);
    step.x = TILE_SIZE;
    step.x *= isFacingRight ? 1 : -1;
    step.y = TILE_SIZE * tan(this.angle);
    step.y *= !isFacingDown && step.y > 0 ? -1 : 1;
    step.y *= isFacingDown && step.y < 0 ? -1 : 1;

    next.set(intercept);

    let foundVer = false;
    const ver = createVector(0, 0);
    while (isInWindow(next)) {
      if (
        this.grid.hasWallAt(
          createVector(next.x - (isFacingRight ? 0 : 1), next.y)
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

    this.isHitVer = verDist < horDist;
    this.hit = this.isHitVer ? ver : hor;
  }
}

function normAngle(angle) {
  return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}

export class Rays {
  constructor(grid, player) {
    this.grid = grid;
    this.player = player;
    this.rays = Array.from(
      { length: WINDOW_WIDTH / RAY_WIDTH },
      () => new Ray(this.grid, this.player)
    );
  }

  update() {
    const startAngle = this.player.angle - FOV / 2;
    const stepAngle = FOV / (WINDOW_WIDTH / RAY_WIDTH);
    this.rays.forEach((ray, idx) => ray.cast(startAngle + idx * stepAngle));
  }

  draw() {
    stroke("red");
    this.rays.forEach((ray) => {
      line(
        MINIMAP_SCALE * this.player.position.x,
        MINIMAP_SCALE * this.player.position.y,
        MINIMAP_SCALE * ray.hit.x,
        MINIMAP_SCALE * ray.hit.y
      );
    });
  }
}
