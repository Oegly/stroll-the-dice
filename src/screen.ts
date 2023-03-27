import { ANGLES, Maze, Point, Tile } from './maze';
import { Mob } from './mob';
import { Player } from './player';
import { a_star, PathNode } from './path';
import { Torch } from './torch';
import { PropertyMatrix } from './utils/propertymatrix';

const BG_CTX = (<HTMLCanvasElement> document.getElementById('background')).getContext('2d') 
const CTX = (<HTMLCanvasElement> document.getElementById('canvas')).getContext('2d');

const CELL_SIZE = 40;
const TILE_PADDING = 4;
const BG = '#446';
const GRID_COLOR = "#ccc";
const TILE_COLOR = "#888";
const PLAYER_COLOR = "#d33";
const OFFSET_X = 0;
const OFFSET_Y = 0;

export class Screen {
  fps: number;
  frameCount: number = 0;
  running: boolean = true;
  player: PlayerSprite;
  torches: TorchSprite[] = [];
  lightMatrix: PropertyMatrix<number>;
  mobs: MobSprite[] = [];
  path: PathNode;

  constructor(player: Player, maze: Maze, goal: Point, fps: number) {
    this.fps = fps;
    this.player = new PlayerSprite(player);
    this.drawMaze(maze, goal);
    [1, 2, 3, 4, 5, 6].forEach(n => this.drawDice(n, true));

    this.path = a_star(maze, {x: 0, y: 0}, goal).reverse()
  }

  render() {
    if (!this.running) {
      return;
    }

    this.frameCount++;

    this.clear();
    // Used for examining mazes
    //drawPath(this.path);
    this.drawPlayer();
    this.drawMobs();
    this.drawTorches();
  }
  
  setState(running: boolean) {
    this.running = running;

    if (!this.running) {
      CTX.save();
      CTX.globalAlpha = 0.2;
      CTX.fillStyle = "#000";

      CTX.fillRect(0, 0, BG_CTX.canvas.width, BG_CTX.canvas.height);

      CTX.restore();

      CTX.fillStyle = "#fff";
      CTX.font = "bold 4em monospace"
      CTX.fillText("PAUSED", 240, 180);
    }
  }

  updateSprites(
    player: Player, torches: Torch[],
    mobs: Mob[], lightMatrix: PropertyMatrix<number>
    ) {
    this.player.update(player);
    this.torches = torches.map(t => new TorchSprite(t));
    this.lightMatrix = lightMatrix;
    this.mobs = mobs.map(m => new MobSprite(m));
  }

  drawMaze(maze: Maze, goal: Point) {
    BG_CTX.clearRect(0, 0, BG_CTX.canvas.width, BG_CTX.canvas.height);

    for (let x = 0; x < maze.width; x++) {
      for (let y = 0; y < maze.height; y++) {
        let cost = maze.costMatrix.find(x, y)/maze.maxCost;

        BG_CTX.save();
        BG_CTX.globalAlpha = 0.85 - cost * 0.45;
        drawTile(maze.grid[x][y], BG_CTX, TILE_COLOR);
        BG_CTX.restore();
      }
    }

    console.log('Goal: ', goal);
    drawRect(goal.x, goal.y, BG_CTX, "#9f9");
  }

  drawPlayer() {
    this.player.draw(1/this.fps);
  }

  drawMobs() {
    this.mobs.map(m => m.draw(1/this.fps));
  }

  drawDice(side: number, working: boolean) {
    console.log('Attempting to draw dice')
    let offset_x = 300;
    let offset_y = 600;

    if (working) {
      BG_CTX.fillStyle = "#eee"
    } else {
      BG_CTX.fillStyle = "#333"
    }

    BG_CTX.font = "40px Arial";
    BG_CTX.fillText(side.toString(), offset_x + (CELL_SIZE + 8) * side, offset_y); 
  } 

  drawTorches() {
    let flicker = 0.035 * Math.abs(2 - (this.frameCount % (this.fps * 4) / this.fps));

    CTX.fillStyle = "#ff4"
    this.torches.forEach(torch => {
      torch.draw(flicker);
      //console.log("Drawing tile!", this.lightMatrix);
      torch.tiles.filter(tile => this.lightMatrix.withinBounds(tile))
      .forEach(tile => {
        let light = this.lightMatrix.find(tile.x, tile.y);
        light = 0.18/(0.18 + Math.pow(Math.E, -light));

        CTX.save()
        CTX.globalAlpha = light + flicker;
        drawRect(tile.x, tile.y, CTX, "#ff4");
        CTX.restore();
      });
    });
  }

  clear() {
    this.frameCount++;
    CTX.clearRect(0, 0, CTX.canvas.width, CTX.canvas.height);
  }

  gameOver() {
    CTX.save()
    CTX.fillStyle = "#000"
    CTX.globalAlpha = 0.6;
    CTX.fillRect(0, 0, CTX.canvas.width, CTX.canvas.height);
    CTX.restore();

    CTX.fillStyle = "#eee"
    CTX.font = "60px Arial";
    CTX.fillText("GAME OVER", 200, 200); 
  }

  victory() {
    CTX.save()
    CTX.fillStyle = "#000"
    CTX.globalAlpha = 0.6;
    CTX.fillRect(0, 0, CTX.canvas.width, CTX.canvas.height);
    CTX.restore();

    CTX.fillStyle = "#eee"
    CTX.font = "60px Arial";
    CTX.fillText("VICTORY!", 200, 200); 
  }
}

const drawRect = (x: number, y: number, ctx: CanvasRenderingContext2D, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(
    x * CELL_SIZE + OFFSET_X + TILE_PADDING,
    y * CELL_SIZE + OFFSET_Y + TILE_PADDING,
    CELL_SIZE - TILE_PADDING,
    CELL_SIZE - TILE_PADDING
  );
};

const drawBridge = (x: number, y: number, angle: Point, ctx: CanvasRenderingContext2D, color: string) => {
    ctx.fillStyle = color;

    // The offset within each cell depends on 
    // a) If it's vertical (x=0, y=1 or -1) or horizontal (x=1 or -1, y=0)
    // b) If it's at the start of the tile (x or y=-1) or the end (x or y=1)
    let mx = (angle.x ? (angle.x < 0 ? 0 : CELL_SIZE) : TILE_PADDING);
    let my = (angle.y ? (angle.y < 0 ? 0 : CELL_SIZE) : TILE_PADDING);

    // Start or end of cell?
    let sx = (Math.sign(angle.x) || 1);
    let sy = (Math.sign(angle.y) || 1);

    ctx.fillRect(
      x * CELL_SIZE + OFFSET_X + mx * sx,
      y * CELL_SIZE + OFFSET_Y + my * sy,
      
      // Width and height according to horizontal / vertical
      angle.x ? TILE_PADDING : CELL_SIZE - TILE_PADDING,
      angle.y ? TILE_PADDING : CELL_SIZE - TILE_PADDING
    );
  };

const drawTile = (tile: Tile, ctx: CanvasRenderingContext2D, color: string) => {
  drawRect(tile.x, tile.y, ctx, color);
  drawBridge(tile.x, tile.y, ANGLES[tile.angle], ctx, color);
};

class PlayerSprite {
  x: number;
  y: number;
  dx: number;
  dy: number;
  facingAngle: number;
  torchCount: number = 0;

  constructor(player: Player) {
    this.update(player);
  }

  update(player: Player) {
    this.x = player.x;
    this.y = player.y;
    this.dx = player.vx;
    this.dy = player.vy;
    this.facingAngle = player.facingAngle;
  }

  draw(dt: number) {
    this.x += this.dx * 5 * dt;
    this.y += this.dy * 5 * dt;

    drawRect(this.x, this.y, CTX, PLAYER_COLOR);
  }
}

class MobSprite {
  x: number;
  y: number;
  dx: number;
  dy: number;
  fear: number;
  stun: number;
  path: PathNode | undefined;

  constructor(mob: Mob) {
    this.update(mob)
  }

  update(mob: Mob) {
    this.x = mob.x;
    this.y = mob.y;
    this.dx = mob.vx;
    this.dy = mob.vy;
    this.fear = mob.fear;
    this.stun = mob.stun;
    this.path = mob.path;
  }

  draw(dt: number) {
    CTX.globalAlpha = 1 / this.stun;
    this.x += this.dx * 5 * dt;
    this.y += this.dy * 5 * dt;
    this.fear = Math.max(this.fear - dt, 0);
    this.stun = Math.max(this.stun - dt, 0);

    let green = (Math.round(this.fear * 10)).toString(16).padStart(2, "0");
    drawRect(this.x, this.y, CTX, "#00" + green + "00");
    CTX.globalAlpha = 1;

    /*if (this.path) {
      drawPath(this.path);
    }*/
  }
}

class TorchSprite {
  x: number;
  y: number;
  r: number;
  tiles: Point[];

  constructor(torch: Torch) {
    this.update(torch)
  }

  update(torch: Torch) {
    this.x = torch.x;
    this.y = torch.y;
    this.r = torch.r;
    this.tiles = torch.tiles();
  }

  draw(flicker: number) {
    let x = this.x * CELL_SIZE;
    let y = this.y * CELL_SIZE;

    CTX.fillRect(x + TILE_PADDING + 9, y + TILE_PADDING + 9, 18, 18);

    CTX.save()

    CTX.globalAlpha = 0.08;
    CTX.beginPath();
    CTX.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE * (this.r * 0.8 + flicker * 2), 0, Math.PI * 2);
    CTX.fill();

    CTX.restore();
  }
}

export const drawPath = (node: PathNode) => {
  while (node) {
    CTX.globalAlpha = 0.8 / node.cost + 0.2;
    drawRect(node.point.x, node.point.y, CTX, "#449944")
    node = node.parent;
  }

  CTX.globalAlpha = 1;
}
