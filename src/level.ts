const seedRandom = require('seedrandom');

const FPS = 60;
const UPS = 5;

import { Game } from './index';
import Inputs from './input';
import { Maze, Point } from './maze';
import { Mob } from './mob';
import { Player } from './player';
import { Screen } from './screen';
import { Torch  } from './torch';

export class Level {
  tickCount: number;
  player: Player;
  inputs: Inputs;
  maze: Maze;
  torches: Torch[];
  torchCooldown: number = 0;
  mobs: Mob[] = [];
  mobCount: number = 0;
  goal: Point;
  screen: Screen;
  playing: Boolean;
  updateInterval: any;
  renderInterval: any;
  game: Game;

  constructor(levelArgs: {seed: number, mobs: Point[], torches: Point[]}, inputs: Inputs, game: Game) {
    this.tickCount = 0;
    this.inputs = inputs;
    this.maze = new Maze(24, 14, {x: 0, y: 0}, 2, levelArgs.seed);
    this.player = new Player(0, 0);
    this.torches = levelArgs.torches.map(t => new Torch(t.x, t.y));
    this.mobs = levelArgs.mobs.map(m => new Mob(m.x, m.y));
    this.goal = {x: 23, y: 13};
    this.screen = new Screen(this.player, this.maze, this.goal, FPS);

    this.playing = true;
    this.game = game;

    this.updateInterval = setInterval(() => this.update(), 1000/UPS);
    this.renderInterval = setInterval(() => requestAnimationFrame(() => this.render()), 1000/FPS);
  }

  update() {
    this.tickCount++;
    this.inputs.update();
    this.player.act(this.inputs, this.maze, this.torches);
    this.mobs.forEach(m => m.act(this.maze, this.player, this.torches));
    this.screen.updateSprites(this.player, this.torches, this.mobs);

    if (this.torchCooldown == 0) {
      if (this.inputs.pressed.includes(' ')) {
        if (this.torches.some(t => t.x == this.player.x && t.y == this.player.y)) {
          this.player.torchCount++;
          this.torches = this.torches.filter(t => !(t.x == this.player.x && t.y == this.player.y));
          this.torchCooldown = 5;
        } else if (this.player.torchCount) {
          this.player.torchCount--;
          this.torches.push(new Torch(this.player.x, this.player.y))
          this.torchCooldown = 5;
        }
      }
    } else {
      this.torchCooldown--;
    }

    // Check collisions between player and mobs
    let attacks = this.mobs.filter(m => {
      let collision = m.x == this.player.x && m.y == this.player.y;
      let fearless = m.fear <= 0;
      let unstunned = m.stun <= 0;

      return collision && fearless && unstunned;
    })

    // Can the player handle this?
    if (attacks != undefined && attacks.length) {
      if (!this.player.immunity) {
        attacks[0].stun = 10;
        
        let die = this.player.rollDie();
        this.screen.drawDice(die, false);
        if (!die) {
          clearInterval(this.updateInterval);
          clearInterval(this.renderInterval);
          requestAnimationFrame(this.screen.gameOver);
        };
      }
    }

    // Check victory condition
    if (this.player.x == this.goal.x && this.player.y == this.goal.y) {
      console.log('VICORY!!!');
      clearInterval(this.updateInterval);
      clearInterval(this.renderInterval);
      //this.screen.victory();
      this.game.changeLevel();
    }
  }

  render() {
    this.screen.clear();
    this.screen.drawPlayer();
    this.screen.drawMobs();
    this.screen.drawTorches();
  }
}
