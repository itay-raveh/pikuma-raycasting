/// <reference path="/home/vscode/.vscode-remote/extensions/samplavigne.p5-vscode-1.2.13/p5types/global.d.ts"/>
export const TILE_SIZE = 60;

const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

export const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
export const WINDOW_HALF_WIDTH = WINDOW_WIDTH / 2;
export const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;
export const WINDOW_HALF_HEIGHT = WINDOW_HEIGHT / 2;

export const FOV = radians(60);
export const RAY_WIDTH = 1;

export const MINIMAP_SCALE = 0.2;

export const DARK = "#222";
export const LIGHT = "#fff";
