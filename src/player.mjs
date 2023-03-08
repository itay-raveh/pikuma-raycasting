/// <reference path="/home/codespace/.vscode-remote/extensions/samplavigne.p5-vscode-1.2.13/p5types/global.d.ts"/>
import { WINDOW_HALF_HEIGHT, WINDOW_HALF_WIDTH } from "./consts.mjs";

export class Player {
  constructor(grid) {
    this.grid = grid;

    this.position = createVector(WINDOW_HALF_WIDTH, WINDOW_HALF_HEIGHT);
    this.positionOffset = createVector(0, 0);

    this.angle = HALF_PI;
    this.moveSpeed = 3;
    this.rotationSpeed = 0.01;
  }

  update() {
    const step = p5.Vector.mult(this.positionOffset, this.moveSpeed);
    const tangentAngle = this.angle - HALF_PI;

    const move = createVector(
      cos(this.angle) * step.y + cos(tangentAngle) * step.x,
      sin(this.angle) * step.y + sin(tangentAngle) * step.x
    );
    const position = p5.Vector.add(this.position, move);

    if (!this.grid.hasWallAt(position)) this.position = position;
  }
}
