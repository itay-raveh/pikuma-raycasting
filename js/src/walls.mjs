import {
  DARK,
  FOV,
  LIGHT,
  RAY_WIDTH,
  SHADOW,
  TILE_SIZE,
  WINDOW_HALF_HEIGHT,
  WINDOW_HALF_WIDTH,
} from "./consts.mjs";

export class Walls {
  constructor(player, rays) {
    this.player = player;
    this.rays = rays;
  }

  draw() {
    for (const i in this.rays.rays) {
      const ray = this.rays.rays[i];
      const distance =
        this.player.position.dist(ray.hit) * cos(ray.angle - this.player.angle);
      const wallStripHeight =
        (TILE_SIZE / distance) * (WINDOW_HALF_WIDTH / tan(FOV / 2));
      fill(DARK);
      rect(
        i * RAY_WIDTH,
        WINDOW_HALF_HEIGHT - wallStripHeight / 2 - 1,
        RAY_WIDTH,
        wallStripHeight + 2
      );
      if (i > 0 && ray.isHitVer !== this.rays.rays[i - 1].isHitVer) fill(DARK);
      else {
        fill(
          lerpColor(
            SHADOW,
            LIGHT,
            map(
              wallStripHeight + ray.isHitVer * wallStripHeight,
              0,
              WINDOW_HALF_HEIGHT,
              0,
              1
            )
          )
        );
      }
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
