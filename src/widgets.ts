import { Game } from './index';
import { getLevel, getMaxLevel, getlevelCount } from './utils/storage';

const BTN_ENABLED = "#888";
const BTN_DISABLED = "#444";
const BTN_ACTIVE = "#999";
const BTN_HOVER = "#aaa";

const TXT_ENABLED = "#fff";
const TXT_DISABLED = "#aaa";
const TXT_ACTIVE = "#ee4";
const TXT_HOVER = "#ff7";

export class PauseMenu {
  game: Game;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  levelButtons: Button[];

  onMouseMove: (event: MouseEvent) => void;
  onClick: (event: MouseEvent) => void;

  constructor(game: Game, ctx: CanvasRenderingContext2D) {
    this.game = game;
    this.ctx = ctx;
    this.x = 240;
    this.y = 180;
    this.width = 200;
    this.height = 200;

    this.levelButtons = Array(getlevelCount()).fill([]).map((btn, level) => {
      let x = this.x + level % 10 * 40;
      let y = this.y + 60 + 60 * Math.floor(level/10);
      let enabled: boolean = level <= getMaxLevel();
      let active = level == getLevel();
  
      let f = () => {
        if (enabled && !active) {
          game.changeLevel(level);
        }
      };
      return new Button(x, y, 32, 32, (level + 1).toString(), enabled, active, f);
    });

    // TODO: See if this can be sensibly combined with Input
    this.onMouseMove = (event: MouseEvent) => {
      this.levelButtons.forEach(btn => btn.hover = false);

      this.levelButtons.filter(
        btn => pointRectCollision(
          event.offsetX, event.offsetY, btn.x, btn.y, btn.width, btn.height
      )).forEach(btn => {
        btn.hover = true
      });

      this.levelButtons.forEach(btn => btn.draw(this.ctx));
    };

    this.onClick = (event: MouseEvent) => {
      let x = event.offsetX;
      let y = event.offsetY;

      let targets = this.levelButtons.filter(
        btn => pointRectCollision(
          event.offsetX, event.offsetY, btn.x, btn.y, btn.width, btn.height
        ));

      if (targets.length) {
        targets[0].f()
      }
    };
  }

  activate() {
    this.ctx.canvas.addEventListener('mousemove', this.onMouseMove);
    this.ctx.canvas.addEventListener('click', this.onClick);
  }

  deactivate() {
    this.ctx.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.ctx.canvas.removeEventListener('click', this.onClick);
  }

  draw() {
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 40px monospace";
    this.ctx.fillText("PAUSED", this.x, this.y);

    this.ctx.font = "bold 16px monospace";
    this.levelButtons.forEach(btn => btn.draw(this.ctx))
  }
}

export class Button {
  x: number;
  y: number;
  width: number;
  height: number;
  face: string;
  enabled: boolean;
  active: boolean;
  hover: boolean = false;

  f: () => void;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    face: string,
    enabled: boolean,
    active: boolean,
    f: () => void,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.face = face;
    this.enabled = enabled;
    this.active = active;
    this.f = f;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Priority for background color Hover > Active > enabled
    let btn = this.enabled ? BTN_ENABLED : BTN_DISABLED;
    btn = this.active ? BTN_ACTIVE : btn;
    ctx.fillStyle = this.hover ? BTN_HOVER : btn;
    ctx.fillRect(this.x, this.y, 32, 32);

    // Priority for text color Hover > Active > enabled
    let txt = this.enabled ? TXT_ENABLED : TXT_DISABLED;
    txt = this.active ? TXT_ACTIVE : txt;
    ctx.fillStyle = this.hover ? TXT_HOVER : txt;
    centerText(ctx, this.face, this.x, this.y, this.width, this.height);
  }
}

const centerText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  ctx.save();
  ctx.textAlign = "center";

  let m = ctx.measureText(text);
  let textHeight = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);
  let drawX = x + width/2;
  let drawY = y + height/2 + textHeight/2;

  ctx.fillText(text, drawX, drawY);
  ctx.restore();
};

const pointRectCollision = (
  px: number, py: number, rx: number, ry: number, rw: number, rh: number
) => {
  return px >= rx && py >= ry && px <= rx + rw && py <= ry + rh;
};