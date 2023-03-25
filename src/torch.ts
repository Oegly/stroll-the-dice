import { Point } from "./maze";
import { euclid } from "./path";

export class Torch {
  x: number;
  y: number;
  r: number = 2.5;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // TODO: Find a better algorithm than brute force
  tiles(): Point[] {
    let r = Math.floor(this.r)
    let ret = [];

    for (let x = this.x - r; x <= this.x + r; x++) {
      for (let y = this.y - r; y <= this.y + r; y++) {
        if (euclid(this, {x: x, y: y}) <= r) {
          ret.push({x: x, y: y});
        }
      }
    }

    return ret;
  }
}
