import {
  DARK,
  FOV_HALF,
  RAY_WIDTH,
  TILE_SIZE,
  WINDOW_HALF_HEIGHT,
  WINDOW_HALF_WIDTH,
} from "./consts.mjs";

export const DISTANCE_TO_PROJECTION = WINDOW_HALF_WIDTH / tan(FOV_HALF);

export class Walls {
  constructor(grid, player, rays) {
    this.grid = grid;
    this.player = player;
    this.rays = rays;
  }

  draw() {
    for (const i in this.rays.rays) {
      const ray = this.rays.rays[i];
      const distance = ray.distance * cos(ray.angle - this.player.angle);
      const wallStripHeight = (TILE_SIZE / distance) * DISTANCE_TO_PROJECTION;

      const b = round(
        255 -
          (distance * 150) / DISTANCE_TO_PROJECTION +
          (ray.isHitVer ? 50 : 0)
      );
      fill(DARK);
      rect(
        i * RAY_WIDTH,
        WINDOW_HALF_HEIGHT - wallStripHeight / 2 - 1,
        RAY_WIDTH,
        wallStripHeight + 2
      );
      if (i > 0 && ray.isHitVer !== this.rays.rays[i - 1].isHitVer) fill(DARK);
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
}
