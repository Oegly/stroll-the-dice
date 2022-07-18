import { Maze, Tile, Point, manhattan, ANGLES } from './maze';
import { Player } from './player';
import { Torch } from './torch';

enum MobState {
  Strolling = 1,
  Hunting = 2,
  Freezing = 3,
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
      case MobState.Hunting: this.hunt(player, maze); break;
      case MobState.Freezing: this.freeze(); break;
      case MobState.Stunned: this.wakeUp(); break;
      default: break;
    }
  }

  evaluate(maze: Maze, player: Player, torches: Torch[]) {
    // Is the mob stunned?
    if (this.stun) {
      return MobState.Stunned;
    };

    this.nearestTorch = torches.sort((a: Point, b: Point): number => {
      return manhattan(this, a) - manhattan(this, b);
    })[0];

    if (this.nearestTorch && manhattan(this, this.nearestTorch) < 4) {
      this.fear = Math.min(this.fear + 5, 15);
    }

    if (this.fear) {
      // This is spooky
      return MobState.Freezing;
    }

    // If the mob is not fearing for its life, look for player
    if (manhattan(this, player) < 6) {
      return MobState.Hunting;
    }

    // Nothing exciting is going on
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

  hunt(player: Player, maze: Maze) {
    let vx = player.x - this.x;
    let vy = player.y - this.y;

    let angle = [0, 1, 2, 3]
    .filter(a => {
      let cx = (ANGLES[a].x && (ANGLES[a].x == Math.sign(vx)));
      let cy = (ANGLES[a].y && (ANGLES[a].y == Math.sign(vy)));

      return cx || cy;
    })
    .filter(a => {
      return maze.legalMove(this.x, this.y, a)
    })[0];

    if (angle != undefined) {
      this.vx = ANGLES[angle].x;
      this.vy = ANGLES[angle].y;
    }
  }

  setStun() {
    this.stun = Math.min(this.stun + 5, 15);
  }

  wakeUp() {
    this.stun = Math.max(this.stun - 1, 0);
  }

  freeze() {
    this.fear = Math.max(this.fear - 1, 0);
  }
}