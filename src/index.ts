const seedRandom = require('seedrandom');

const FPS = 60;
const UPS = 5;


import Inputs from './input';
import { Maze, Point } from './maze';
import { Mob } from './mob';
import { Player } from './player';
import { Screen } from './screen';
import { Torch  } from './torch';
import { Level } from './level';

const levelArgs: {seed: number, mobs: Point[], torches: Point[]}[] = require('./levels.json')
/*[
  {seed: 1, mobs: [{x: 22, y: 12}], torches: [{x: 1, y: 3}]},
  {seed: 12, mobs: [{x: 22, y: 9}, {x: 21, y: 10}], torches: [{x: 23, y: 0}]},
  {seed: 75, mobs: [{x: 22, y: 12}, {x: 16, y: 0}, {x: 18, y: 8}, {x: 22, y: 13}], torches: [{x: 3, y: 8}, {x: 9, y: 0}]},
]*/

export class Game {
  inputs: Inputs;
  level: Level;
  levelCount: number = 0;
  tickInterval: any;

  constructor() {
    this.inputs = new Inputs()
    this.level = new Level(levelArgs[this.levelCount], this.inputs, this);
  }

  changeLevel() {
    this.levelCount += 1

    if (this.levelCount >= levelArgs.length) {
      requestAnimationFrame(() => this.level.screen.victory());
      return;
    }

    this.level = new Level(levelArgs[this.levelCount], this.inputs, this);
  }
}

const GAME = new Game();

window.addEventListener('keydown', (event) => {
  GAME.inputs.press(event.key);
});

window.addEventListener('keyup', (event) => {
  GAME.inputs.release(event.key);
});
