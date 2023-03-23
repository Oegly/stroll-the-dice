import { Point } from "./maze";
import { euclid } from "./path";

export class Torch {
  x: number;
  y: number;
  r: number = 2;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // TODO: Find a better algorithm than brute force
  tiles(): Point[] {
    let ret = [];

    for (let x = this.x - this.r; x <= this.x + this.r; x++) {
      for (let y = this.y - this.r; y <= this.y + this.r; y++) {
        if (euclid(this, {x: x, y: y}) <= this.r) {
          ret.push({x: x, y: y});
        }
      }
    }

    return ret;
  }
}
