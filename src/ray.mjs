import { MINIMAP_SCALE, TILE_SIZE } from "./consts.mjs";
import { isInWindow } from "./grid.mjs";

export class Ray {
  constructor(angle, grid, player) {
    this.grid = grid;
    this.player = player;

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
