const canvas = document.getElementById("canvas");
canvas.height = 900;
canvas.width = 1600;

const ctx = canvas.getContext('2d');

const CELL_SIZE = 30; // px
const LINE_WIDTH = 22;
const WALL_LENGTH = 28;
const TILE_PADDING = 2;
const GRID_COLOR = "#cccccc";
const WALL_COLOR = "#cccccc";
const PLAYER_COLOR = "#ff4444";
const OFFSET_X = 0;
const OFFSET_Y = 0;

const drawRect = (x, y, ctx, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(
    x * WALL_LENGTH + OFFSET_X + TILE_PADDING,
    y * WALL_LENGTH + OFFSET_Y + TILE_PADDING,
    WALL_LENGTH - TILE_PADDING,
    WALL_LENGTH - TILE_PADDING);
};

const drawBridge = [
  (x, y, ctx, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(
      x * WALL_LENGTH + OFFSET_X + TILE_PADDING,
      y * WALL_LENGTH + OFFSET_Y - TILE_PADDING,
      WALL_LENGTH - TILE_PADDING,
      TILE_PADDING * 2);
  },
  (x, y, ctx, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(
      x * WALL_LENGTH + OFFSET_X + WALL_LENGTH - TILE_PADDING,
      y * WALL_LENGTH + OFFSET_Y + TILE_PADDING,
      TILE_PADDING * 2,
      WALL_LENGTH - TILE_PADDING);
  },
  (x, y, ctx, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(
      x * WALL_LENGTH + OFFSET_X + TILE_PADDING,
      y * WALL_LENGTH + OFFSET_Y + WALL_LENGTH - TILE_PADDING,
      WALL_LENGTH - TILE_PADDING,
      TILE_PADDING * 2);
  },
  (x, y, ctx, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(
      x * WALL_LENGTH + OFFSET_X - TILE_PADDING,
      y * WALL_LENGTH + OFFSET_Y + TILE_PADDING,
      TILE_PADDING * 2,
      WALL_LENGTH - TILE_PADDING);
  },
];

const drawMathyBridge = (x, y, angle, ctx, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(
    x * WALL_LENGTH + OFFSET_X,
    y * WALL_LENGTH + OFFSET_Y,
    TILE_PADDING,
    TILE_PADDING);
};

const drawTile = (x, y, angle, ctx, color) => {
  drawRect(x, y, ctx, color);
  drawBridge[angle](x, y, ctx, color);
};

const render_loop = (ctx, maze) => {
  return () => {
    maze.extendMaze();
    _wall = maze.lastWall;
    drawTile(_wall.x, _wall.y, _wall.angle, ctx, WALL_COLOR);

    if (!maze.done) {
      setTimeout(() => {requestAnimationFrame(render_loop(ctx, maze));}, 0);
    }
  }
};

const drawPlayer = () => {
  let _wall = maze.grid[Math.floor(player.x)][Math.floor(player.y)];
  drawRect(player.px, player.py, ctx, WALL_COLOR);
  drawRect(player.x, player.y, ctx, PLAYER_COLOR);
  //drawTile(_wall.x, _wall.y, _wall.angle, ctx, PLAYER_COLOR);
};

const maze = new Maze(36, 18, [0, 0], 2);
const player = new Player(maze);

//requestAnimationFrame(render_loop(ctx, maze));

while (!maze.done) {
  maze.extendMaze();
  let _wall = maze.lastWall;
  drawTile(_wall.x, _wall.y, _wall.angle, ctx, WALL_COLOR);
}

document.getElementById("seed").innerHTML = mazeSeed;

requestAnimationFrame(() => { drawRect(player.x, player.y, ctx, PLAYER_COLOR); });

window.addEventListener('keydown', (event) => {
  if (event.code == "KeyW" || event.code == "ArrowUp") {
    player.move(0);
  }
  if (event.code == "KeyA" || event.code == "ArrowLeft") {
    player.move(3);
  }
  if (event.code == "KeyS" || event.code == "ArrowDown") {
    player.move(2);
  }
  if (event.code == "KeyD" || event.code == "ArrowRight") {
    player.move(1);
  }

  requestAnimationFrame(drawPlayer);
  console.log(event.code);
});
