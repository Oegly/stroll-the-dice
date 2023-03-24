import { Maze, Tile, Point, ANGLES } from './maze';
import { a_star, escape, PathNode, euclid, manhattan } from './path';
import { Player } from './player';
import { Torch } from './torch';
import { PropertyMatrix } from './utils/propertymatrix';

const FOV = 5;

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

  act(maze: Maze, player: Player, torches: Torch[], lightMatrix: PropertyMatrix<number>) {
    this.x += this.vx;
    this.y += this.vy;
    this.vx = 0;
    this.vy = 0;

    this.state = this.evaluate(maze, player, torches, lightMatrix)
    switch (this.state) {
      case MobState.Strolling: this.stroll(maze, lightMatrix); break;
      case MobState.Hunting: this.hunt(player, maze, torches, lightMatrix); break;
      case MobState.Fleeing: this.flee(lightMatrix); break;
      case MobState.Stunned: this.wakeUp(); break;
      default: break;
    }
  }

  followPath(lightMatrix: PropertyMatrix<number>) {
    if (!(this.path && manhattan(this, this.path.point) == 1)) {
      return false;
    }

    let light_a = lightMatrix.find(this.x, this.y);
    let light_b = lightMatrix.find(this.path.point.x, this.path.point.y)

    if (light_a < light_b) {
      //this.path = undefined;
      return false;
    }

    this.vx = this.path.point.x - this.x;
    this.vy = this.path.point.y - this.y;

    this.path = this.path?.parent;

    return true;
  }

  evaluate(maze: Maze, player: Player, torches: Torch[], lightMatrix: PropertyMatrix<number>) {
    // Is the mob stunned?
    if (this.stun) {
      return MobState.Stunned;
    };

    this.nearestTorch = torches.sort((a: Point, b: Point): number => {
      return euclid(this, a) - euclid(this, b);
    })[0];

    if (this.nearestTorch && lightMatrix.find(this.x, this.y)) {
      const unsafe = this.unsafeTiles(torches, lightMatrix);

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

  stroll(maze: Maze, lightMatrix: PropertyMatrix<number>) {
    if(Math.random() < 0.90 ) {
      return;
    }

    let neighbors: Point[] = maze.legalNeighbors(this.x, this.y)
    let next = neighbors[Math.floor(Math.random() * neighbors.length)];

    this.path = new PathNode(next, 1, undefined);
    this.followPath(lightMatrix);
  }

  hunt(player: Player, maze: Maze, torches: Torch[], lightMatrix: PropertyMatrix<number>) {
    // Try to follow path, recalculate if not possible
    const unsafe = this.unsafeTiles(torches, lightMatrix);

    if (!this.followPath(lightMatrix)) {
      this.path = a_star(
        maze, {x: this.x, y: this.y}, {x: player.x, y: player.y}, 5, unsafe
      )?.parent;

      this.followPath(lightMatrix);
    }
  }

  unsafeTiles(torches: Torch[], lightMatrix: PropertyMatrix<number>): Point[] {
    return [...torches.map(t => t.tiles())].flat()
    .filter(t => lightMatrix.withinBounds({x: t.x, y: t.y}))
    .filter(t => lightMatrix.find(t.x, t.y) > lightMatrix.find(this.x, this.y));
  }

  setStun() {
    this.stun = Math.min(this.stun + 5, 15);
  }

  wakeUp() {
    this.stun = Math.max(this.stun - 1, 0);
  }

  flee(lightMatrix: PropertyMatrix<number>) {
    this.fear = Math.max(this.fear - 1, 0);
    this.followPath(lightMatrix);
  }
}
