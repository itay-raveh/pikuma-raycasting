#include <SDL2/SDL.h>
#include <stdio.h>

#include "consts.h"

SDL_Window *window = NULL;
SDL_Renderer *renderer = NULL;
int isGameRunning = FALSE;

int initWindow() {
  if (SDL_Init(SDL_INIT_EVERYTHING) != 0) {
    fprintf(stderr, "Error in SDL initialization\n");
    return FALSE;
  }

  window = SDL_CreateWindow("Pikuma Raycasting", SDL_WINDOWPOS_CENTERED,
                            SDL_WINDOWPOS_CENTERED, WINDOW_WIDTH, WINDOW_HEIGHT,
                            SDL_WINDOW_BORDERLESS);

  if (!window) {
    fprintf(stderr, "Error in SDL window initialization\n");
    return FALSE;
  }

  renderer = SDL_CreateRenderer(window, -1, 0);

  if (!renderer) {
    fprintf(stderr, "Error in SDL renderer initialization\n");
    return FALSE;
  }

  SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_BLEND);

  return TRUE;
}

void destroyWindow() {
  SDL_DestroyRenderer(renderer);
  SDL_DestroyWindow(window);
  SDL_Quit();
}

int main() {
  isGameRunning = initWindow();

  // TODO: setup();

  while (isGameRunning) {
    /*
    TODO:
        processInput();
        update();
        render();
    */
  }

  destroyWindow();

  return 0;
}
