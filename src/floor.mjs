import {
  LIGHT,
  SHADOW,
  WINDOW_HALF_HEIGHT,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from "./consts.mjs";

export class Floor {
  draw() {
    for (let i = WINDOW_HALF_HEIGHT; i <= WINDOW_HEIGHT; i++) {
      stroke(
        lerpColor(
          SHADOW,
          LIGHT,
          0.5 + map(i, WINDOW_HALF_HEIGHT, WINDOW_HEIGHT, 0, 0.5)
        )
      );
      line(0, i, WINDOW_WIDTH, i);
    }
  }
}
