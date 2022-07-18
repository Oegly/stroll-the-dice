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

    const movement = inputs.pressed
      .filter((i) => ['w', 'a', 's', 'd'].includes(i))
      .slice(-1)[0];
    
    let angle: number;
    switch(movement) {
      case 'w': angle = 0; break;
      case 'd': angle = 1; break;
      case 's': angle = 2; break;
      case 'a': angle = 3; break;
      default: return;
    }

    let _a = ANGLES[angle];
    if (maze.legalMove(this.x, this.y, angle)) {
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
