const seedRandom = require('seedrandom');

const NORTH = {x: 0, y: -1};
const EAST = {x: 1, y: 0};
const SOUTH = {x: 0, y: 1};
const WEST = {x: -1, y: 0};

export const ANGLES = [NORTH, EAST, SOUTH, WEST];

export interface Point {
  x: number;
  y: number;
};

const choice = (lst: any[], rng: () => number): number => {
  return lst[Math.floor(rng() * lst.length)];
};

export class Tile {
  x: number;
  y: number;
  angle: number;

  constructor(x: number, y: number, angle: number) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  getNeighbor(angle: number): Point {
    return {'x': this.x + ANGLES[angle].x, 'y': this.y + ANGLES[angle].y};
  }

  get parent(): Point {
    return this.getNeighbor(this.angle);
  }

  get parentAngle(): number {
    return (this.angle + 2) % 4;
  }
}

export class Maze {
  width: number;
  height: number;
  grid: Tile[][];
  start: Tile;
  lastTile: Tile;
  done: Boolean;
  seed: number;

  rng: () => number;

  constructor(
    width: number,
    height: number,
    start: {x: number, y: number},
    angle: number,
    seed: number
    ) {
    this.width = width;
    this.height = height;
    this.seed = seed;
    this.rng = seedRandom(seed);

    this.grid = new Array(width);

    for (let i = 0; i < width; i++) {
      this.grid[i] = new Array(height);
    }

    this.start = new Tile(start.x, start.y, angle);
    this.pushTile(this.start);

    this.done = false;
    while(!this.done) {
      this.extendMaze();
    }
  }

  extendMaze() {
    this.extendTile(this.lastTile);
  }

  extendTile(tile: Tile) {
    let x = tile.x;
    let y = tile.y;
    let d = [];

    for (let i = 0; i < 4; i++) {
      if (this.freeTile(x, y, i)) {
	      d.push(i);
      }
    }

    if(d.length > 0) {
      let angle = choice(d, this.rng);
      let _w = tile.getNeighbor(angle);
      this.pushTile(new Tile(_w.x, _w.y, (angle + 2) % 4));
      return;
    }

    this.backtrace(tile);
  }

  backtrace(tile: Tile) {
    if (tile.x == this.start.x  && tile.y == this.start.x) {
      this.done = true;
      console.log(this.seed);
      return;
    }

    this.extendTile(this.findTile(tile.parent.x, tile.parent.y));
  }

  pushTile(tile: Tile) {
    this.grid[tile.x][tile.y] = tile;
    this.lastTile = tile;
  }

  findTile(x: number, y: number) {
    return this.grid[x][y];
  }

  withinBounds(x: number, y: number) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  freeTile(x: number, y: number, angle: number) {
    let _x = x + ANGLES[angle].x;
    let _y = y + ANGLES[angle].y;

    return this.withinBounds(_x, _y) && !this.findTile(_x, _y);
  }

  legalMove(x: number, y: number, angle: number) {
    let _a = ANGLES[angle];

    if (!this.withinBounds(x + _a.x, y + _a.y)) {
      return false;
    }

    let home = this.grid[Math.round(x)][Math.ceil(y)];
    let target = this.grid[Math.round(x + _a.x)][Math.ceil(y + _a.y)];

    return target.angle == (angle + 2) % 4 || home.angle == angle;
  }

  legalNeighbors(x: number, y: number) {
    return [0, 1, 2, 3]
    .filter(a => this.legalMove(x, y, a))
    .map(a => this.findTile(x + ANGLES[a].x, y + ANGLES[a].y));
  }
}
