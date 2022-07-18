import Inputs from "./input";
import { Maze, ANGLES } from "./maze";
import { Torch } from "./torch";

export class Player {
  x: number;
  y: number;
  dx: number = 0;
  dy: number = 0;
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

  /*act(inputs: string[], stage: Stage | null, dt: number) {
    if (this.hp <= 0) {
      return;
    }
    if (inputs.includes(' ')) {
      console.log('space pressed');
      stage?.placeBomb(this.id, this.x, this.y);
    }

    this.x += this.dx * dt / 1000;
    this.y += this.dy * dt / 1000;
    
    this.dx = 0;
    this.dy = 0;

    // Check only inputs for movement. If there are several, give priority to the last.
    const movement = inputs
      .filter((i) => ['w', 'a', 's', 'd'].includes(i))
      .slice(-1)[0];
    
    switch(movement) {
      case 'w': this.dy = -this.speed; break;
      case 's': this.dy = this.speed; break;
      case 'a': this.dx = -this.speed; break;
      case 'd': this.dx = this.speed; break;

    }*/

  move(inputs: Inputs, maze: Maze, torches: Torch[]) {
    this.immunity = Math.max(0, this.immunity - 1);
    let changed = false;

    if (this.dx || this.dy) {
      changed = true;
    }

    this.x += this.dx;
    this.y += this.dy;

    this.dx = 0;
    this.dy = 0;

    if (inputs.pressed.includes(' ')) {
      //this.handleTorch(torches);
    }

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
      this.dx = _a.x;
      this.dy = _a.y;
      this.facingAngle = (angle + 2) % 4;
    }
  }

  rollDie(): number {
    let roll = 1 + Math.floor(Math.random() * 6)
    console.log('Player rolled %d to protect from mob.', roll, this.die);

    if (this.die.includes(roll)) {
      this.die = this.die.filter(n => n != roll);
      this.immunity = 5;

      console.log('Player rolled %d to protect from mob.', roll);
      return roll;
    }

    console.log('FAILED TO PROTECT AGAINST ATTACK WITH %d', roll)
    return 0;
  }
}
