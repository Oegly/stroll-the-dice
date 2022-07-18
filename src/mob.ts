import { Maze, Tile, Point, manhattan, ANGLES } from './maze';
import { Player } from './player';
import { Torch } from './torch';

enum MobState {
  Strolling = 1,
  Hunting = 2,
  Fleeing = 3,
  Stunned = 4,
};

export class Mob {
  id: number;
  x: number;
  y: number;
  dx: number = 0;
  dy: number = 0;
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
    this.x += this.dx;
    this.y += this.dy;
    this.dx = 0;
    this.dy = 0;

    this.state = this.evaluate(maze, player, torches)
    //console.log('State:', this.state);
    switch (this.state) {
      case MobState.Strolling: this.stroll(maze); break;
      case MobState.Hunting: this.hunt(player, maze); break;
      case MobState.Fleeing: this.flee(maze); break;
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
      //console.log('Fear: ', this.fear);
      return MobState.Fleeing;
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

    this.dx = ANGLES[angle].x;
    this.dy = ANGLES[angle].y;
  }

  hunt(player: Player, maze: Maze) {
    let dx = player.x - this.x;
    let dy = player.y - this.y;

    let angle = [0, 1, 2, 3]
    .filter(a => {
      let cx = (ANGLES[a].x && (ANGLES[a].x == Math.sign(dx)));
      let cy = (ANGLES[a].y && (ANGLES[a].y == Math.sign(dy)));

      return cx || cy;
    })
    .filter(a => {
      return maze.legalMove(this.x, this.y, a)
    })[0];

    if (angle != undefined) {
      this.dx = ANGLES[angle].x;
      this.dy = ANGLES[angle].y;
    }
  }

  attack() {}

  setStun() {
    //this.state == MobState.Stunned;
    this.stun = Math.min(this.stun + 5, 15);
  }

  wakeUp() {
    this.stun = Math.max(this.stun - 1, 0);
  }

  flee(maze: Maze) {
    this.fear = Math.max(this.fear - 1, 0);
    /*
    let dx = this.x - this.nearestTorch.x;
    let dy = this.y - this.nearestTorch.y;

    let angle = [0, 1, 2, 3]
    .filter(a => {
      let cx = (ANGLES[a].x && (ANGLES[a].x == Math.sign(dx)));
      let cy = (ANGLES[a].y && (ANGLES[a].y == Math.sign(dy)));

      return cx || cy;
    })
    .filter(a => {
      return maze.legalMove(this.x, this.y, a)
    })[0];

    console.log('Angle:', angle);
    if (angle != undefined) {
      this.dx = ANGLES[angle].x;
      this.dy = ANGLES[angle].y;
    }*/
  }
}