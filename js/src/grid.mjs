/// <reference path="/home/codespace/.vscode-remote/extensions/samplavigne.p5-vscode-1.2.13/p5types/global.d.ts"/>
import {
  DARK,
  LIGHT,
  MINIMAP_SCALE,
  TILE_SIZE,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from "./consts.mjs";

function pixels2index(p) {
  return floor(p / TILE_SIZE);
}

export function isInWindow(position) {
  return (
    position.x >= 0 &&
    position.x <= WINDOW_WIDTH &&
    position.y >= 0 &&
    position.y <= WINDOW_HEIGHT
  );
}

export class Grid {
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
      !!this.grid[pixels2index(position.y)][pixels2index(position.x)]
    );
  }

  draw() {
    stroke(DARK);
    for (const i in this.grid) {
      for (const j in this.grid[i]) {
        const x = j * TILE_SIZE;
        const y = i * TILE_SIZE;

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
