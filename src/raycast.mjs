/// <reference path="/home/codespace/.vscode-remote/extensions/samplavigne.p5-vscode-1.2.13/p5types/global.d.ts"/>
import { DARK, WINDOW_HEIGHT, WINDOW_WIDTH } from "./consts.mjs";
import { Floor } from "./floor.mjs";
import { Grid } from "./grid.mjs";
import { Player } from "./player.mjs";
import { Rays } from "./rays.mjs";
import { Walls } from "./walls.mjs";

const GRID = new Grid();
const PLAYER = new Player(GRID);
const RAYS = new Rays(GRID, PLAYER);

const UPDATEABLES = [PLAYER, RAYS];
const DRAWABLES = [new Floor(), new Walls(PLAYER, RAYS), GRID, RAYS];

let CANVAS;

window.keyPressed = () => {
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

window.keyReleased = () => {
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

document.addEventListener(
  "pointerlockchange",
  () => {
    window.mouseMoved =
      document.pointerLockElement === CANVAS
        ? (e) => (PLAYER.angle += e.movementX * PLAYER.rotationSpeed)
        : () => {};
  },
  false
);

window.setup = () => {
  CANVAS = createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT).elt;

  CANVAS.addEventListener("click", async () => {
    await CANVAS.requestPointerLock();
  });
};

window.draw = () => {
  clear(DARK);

  UPDATEABLES.forEach((updateable) => updateable.update());
  DRAWABLES.forEach((drawable) => {
    push();
    drawable.draw();
    pop();
  });
};
