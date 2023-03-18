import { Maze, Tile, Point, ANGLES } from './maze';
import { a_star, escape, PathNode, euclid, manhattan } from './path';
import { Player } from './player';
import { Torch } from './torch';

enum MobState {
  Strolling = 1,
  Hunting = 2,
  Fleeing = 3,
  Stunned = 4,
};

export class Mob {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  state: MobState = MobState.Strolling;
  fear: number = 0;
  stun: number = 0;
  nearestTorch: Torch | null = null;
  screeching: boolean = false;
  path: PathNode | undefined;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  act(maze: Maze, player: Player, torches: Torch[]) {
    this.x += this.vx;
    this.y += this.vy;
    this.vx = 0;
    this.vy = 0;

    this.state = this.evaluate(maze, player, torches)
    switch (this.state) {
      case MobState.Strolling: this.stroll(maze); break;
      case MobState.Hunting: this.hunt(player, maze, torches); break;
      case MobState.Fleeing: this.flee(); break;
      case MobState.Stunned: this.wakeUp(); break;
      default: break;
    }
  }

  followPath() {
    if (!(this.path && manhattan(this, this.path.point) == 1)) {
      return false;
    }

    this.vx = this.path.point.x - this.x;
    this.vy = this.path.point.y - this.y;

    this.path = this.path?.parent;

    return true;
  }

  evaluate(maze: Maze, player: Player, torches: Torch[]) {
    // Is the mob stunned?
    if (this.stun) {
      return MobState.Stunned;
    };

    this.nearestTorch = torches.sort((a: Point, b: Point): number => {
      return euclid(this, a) - euclid(this, b);
    })[0];

    if (this.nearestTorch && euclid(this, this.nearestTorch) <= 2) {
      const unsafe = [...torches.map(t => t.tiles(2))].flat();
      this.path = escape(maze, {x: this.x, y: this.y}, this.nearestTorch, 5, unsafe)?.parent;
      this.fear = Math.min(this.fear + 5, 15);
    }

    if (this.fear) {
      return MobState.Fleeing;
    }

    // If the mob is not fearing for its life, look for player
    if (this.path || euclid(this, player) < 4) {
      return MobState.Hunting;
    }

    // Nothing exciting is going on
    this.path = undefined;
    return MobState.Strolling;
  }

  stroll(maze: Maze) {
    if(Math.random() < 0.90 ) {
      return;
    }

    let neighbors: number[] = [0, 1, 2, 3].filter((v: any, i: number) => {
      return maze.legalMove(this.x, this.y, i)
    });

    let angle = neighbors[Math.floor(Math.random() * neighbors.length)];

    this.vx = ANGLES[angle].x;
    this.vy = ANGLES[angle].y;
  }

  hunt(player: Player, maze: Maze, torches: Torch[]) {
    // Try to follow path, recalculate if not possible
    const unsafe = [...torches.map(t => t.tiles(2))].flat();
    //console.log(unsafe);

    if (!this.followPath()) {
      this.path = a_star(
        maze, {x: this.x, y: this.y}, {x: player.x, y: player.y}, 5, unsafe
      )?.parent;

      this.followPath();
    }
  }

  setStun() {
    this.stun = Math.min(this.stun + 5, 15);
  }

  wakeUp() {
    this.stun = Math.max(this.stun - 1, 0);
  }

  flee() {
    this.fear = Math.max(this.fear - 1, 0);
    this.followPath();
  }
}
