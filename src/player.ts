import Inputs from "./input";
import { Maze, ANGLES } from "./maze";
import { Torch } from "./torch";

export class Player {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  px: number = 0;
  py: number = 0;
  immunity: number = 5;
  die: number[] = [1, 2, 3, 4, 5, 6];
  facingAngle: number;
  torchCount: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  act(inputs: Inputs, maze: Maze, torches: Torch[]) {
    this.immunity = Math.max(0, this.immunity - 1);
    let changed = false;

    if (this.vx || this.vy) {
      changed = true;
    }

    this.x += this.vx;
    this.y += this.vy;

    this.vx = 0;
    this.vy = 0;

    // Find angles corresponding to pressed keys, and check legality
    // Checking multiple angles allows the player to move "diagonally"
    let legalMoves = inputs.pressed
    .filter((i) => ['w', 'a', 's', 'd'].includes(i))
    .map(btn => keyToAngle[btn])
    .filter(angle => maze.legalMove(this.x, this.y, angle));

    if (legalMoves.length) {
      // Last key in the list is the last one pressed
      let angle = legalMoves[legalMoves.length - 1];
      let _a = ANGLES[angle];
      this.px = this.x;
      this.py = this.y;
      this.vx = _a.x;
      this.vy = _a.y;
      this.facingAngle = (angle + 2) % 4;
    }
  }

  rollDie(): number {
    let roll = 1 + Math.floor(Math.random() * 6);

    if (this.die.includes(roll)) {
      this.die = this.die.filter(n => n != roll);
      this.immunity = 5;

      console.log('Player rolled %d to protect from mob.', roll);
      return roll;
    }

    console.log('Side %d is corrupted. Failed to protect against mob.', roll)
    return 0;
  }
}

const keyToAngle: {[key: string]: number} = {
  'w': 0,
  'd': 1,
  's': 2,
  'a': 3
};
