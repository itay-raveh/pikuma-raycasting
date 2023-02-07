import {
  MINIMAP_SCALE,
  WINDOW_HALF_HEIGHT,
  WINDOW_HALF_WIDTH,
} from "./consts.mjs";

const DEG90 = radians(90);

export class Player {
  constructor(grid) {
    this.grid = grid;

    this.position = createVector(WINDOW_HALF_WIDTH, WINDOW_HALF_HEIGHT);
    this.positionOffset = createVector(0, 0);

    this.radius = 5;
    this.angle = DEG90;
    this.moveSpeed = 3;
    this.rotationSpeed = 10;
  }

  update() {
    const step = p5.Vector.mult(this.positionOffset, this.moveSpeed);
    const tangentAngle = this.angle - DEG90;

    const move = createVector(
      cos(this.angle) * step.y + cos(tangentAngle) * step.x,
      sin(this.angle) * step.y + sin(tangentAngle) * step.x
    );
    const position = p5.Vector.add(this.position, move);

    if (!this.grid.hasWallAt(position)) this.position = position;
  }

  draw() {
    noStroke();
    fill("red");
    circle(
      MINIMAP_SCALE * this.position.x,
      MINIMAP_SCALE * this.position.y,
      MINIMAP_SCALE * this.radius
    );
  }
}
