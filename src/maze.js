mazeSeed = 1; //Math.random();
Math.seedrandom(mazeSeed);

const DIRECTION = [
  {'x': 0, 'y': -1}, // North
  {'x': 1, 'y': 0},  // East
  {'x': 0, 'y': 1},  // South
  {'x': -1, 'y': 0}  // West
];

const choice = (lst) => {
  return lst[Math.floor(Math.random() * lst.length)];
}

class Wall {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  getNeighbor(angle) {
    return {'x': this.x + DIRECTION[angle].x, 'y': this.y + DIRECTION[angle].y};
  }

  get parent() {
    return this.getNeighbor(this.angle);
  }

  get parentAngle() {
    return (this.angle + 2) % 4;
  }

  get position() {
    return [x, y];
  }
}

class Maze {
  constructor(width, height, start_position, start_angle) {
    this.done = false;
    this.start = {'x': start_position[0], 'y': start_position[1]};
    this.width = width;
    this.height = height;

    this.grid = new Array(width);

    for (let i = 0; i < width; i++) {
      this.grid[i] = new Array(height);
    }

    this.pushWall(new Wall(this.start.x, this.start.y, start_angle));
  }

  extendMaze() {
    this.extendWall(this.lastWall);
  }

  extendWall(wall) {
    let x = wall.x;
    let y = wall.y;
    let d = [];

    for (let i = 0; i < 4; i++) {
      if (this.legalPath(x, y, i)) {
	d.push(i);
      }
    }

    if(d.length > 0) {
      let angle = choice(d);
      let _w = wall.getNeighbor(angle);
      //console.log(wall, _w);
      this.pushWall(new Wall(_w.x, _w.y, (angle + 2) % 4));
      return;
    }

    //console.log("No wall can be legally extended from " + x + "," + y + ".");
    this.backtrace(wall);
  }

  backtrace(wall) {
    if (wall.x == this.start.x  && wall.y == this.start.x) {
      console.log("We're back to start.");
      this.done = true;
      console.log(mazeSeed);
      return;
    }

    this.extendWall(this.findWall(wall.parent.x, wall.parent.y));
  }

  pushWall(wall) {
    this.grid[wall.x][wall.y] = wall;
    this.lastWall = wall;

    this.lastX = wall.x;
    this.lastY = wall.y;
    this.lastAngle = wall.angle;

    this.last = {
      'x': wall.x,
      'y': wall.y,
      'angle': wall.angle,
    };
  }

  findWall(x, y) {
    return this.grid[x][y];
  }

  legalPoint(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return true;
    }

    return false;
  }

  availablePoint(x, y) {
    if (this.grid[x][y] == undefined) {
      return true;
    }

    return false;
  }

  legalPath(x, y, angle) {
    let _x = x + DIRECTION[angle].x;
    let _y = y + DIRECTION[angle].y;

    return this.legalPoint(_x, _y) && this.availablePoint(_x, _y);
  }
}

class Player {
  constructor(maze) {
    this.maze = maze;
    this.width = 1;
    this.height = 1;
    this.x = 0;
    this.y = 0;
    this.px = 0;
    this.py = 0;
  }

  input(event) {

  }

  move(d) {
    if (this.x >= this.maze.width ||
	this.y >= this.maze.height ||
	this.x < 0 ||
	this.y < 0) {
      return;
    }

    let _d = DIRECTION[d];
    let target = this.maze.findWall(Math.ceil(this.x + _d.x), Math.ceil(this.y + _d.y));
    let home = this.maze.findWall(Math.floor(this.x), Math.floor(this.y));

    if (target.angle == (d + 2) % 4 || home.angle == d) {
      this.px = this.x;
      this.py = this.y;
      this.x += _d.x;
      this.y += _d.y;
    }
  }
}
