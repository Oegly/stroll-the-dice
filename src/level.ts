const seedRandom = require('seedrandom');

const FPS = 60;
const UPS = 5;

export type levelArgs = {seed: number, mobs: Point[], torches: Point[]}; 

import { Game } from './index';
import Inputs from './input';
import { Maze, Point } from './maze';
import { Mob } from './mob';
import { Player } from './player';
import { Screen } from './screen';
import { Torch  } from './torch';
import { euclid, manhattan } from './path';

export class Level {
  args: levelArgs;
  running: boolean = true;
  tickCount: number;
  player: Player;
  maze: Maze;
  torches: Torch[];
  torchCooldown: number = 0;
  mobs: Mob[] = [];
  mobCount: number = 0;
  goal: Point;
  screen: Screen;
  playing: Boolean;
  renderInterval: any;
  game: Game;

  constructor(args: levelArgs, inputs: Inputs, game: Game) {
    this.game = game;
    this.args = args;
    this.maze = new Maze(24, 14, {x: 0, y: 0}, 2, args.seed);
    this.goal = {x: 23, y: 13};
    this.maze.setCost();

    this.start(this.args);

    this.renderInterval = setInterval(() => requestAnimationFrame(() => this.render()), 1000/FPS);
  }

  start(levelArgs: {seed: number, mobs: Point[], torches: Point[]}) {
    this.tickCount = 0;
    this.player = new Player(0, 0);
    this.torches = levelArgs.torches.map(t => new Torch(t.x, t.y));
    this.mobs = levelArgs.mobs.map(m => new Mob(m.x, m.y));
    this.playing = true;
    this.screen = new Screen(this.game, this.player, this.maze, this.goal, FPS);
    this.setLightLevels();
  }

  update(inputs: Inputs) {
    this.tickCount++;
    this.player.act(inputs, this.maze, this.torches);
    this.mobs.forEach(m => m.act(this.maze, this.player, this.torches));
    this.screen.updateSprites(this.player, this.torches, this.mobs, this.maze.lightMatrix);

    if (this.torchCooldown == 0) {
      if (inputs.pressed.includes(' ')) {
        if (this.torches.some(t => t.x == this.player.x && t.y == this.player.y)) {
          this.player.torchCount++;
          this.torches = this.torches.filter(t => !(t.x == this.player.x && t.y == this.player.y));
          this.torchCooldown = 5;
        } else if (this.player.torchCount) {
          this.player.torchCount--;
          this.torches.push(new Torch(this.player.x, this.player.y))
          this.torchCooldown = 5;
        }

        this.setLightLevels();
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
          // Restart the level
          console.log("Restaring!")
          this.start(this.args);
        };
      }
    }

    // Check victory condition
    if (this.player.x == this.goal.x && this.player.y == this.goal.y) {
      console.log('VICORY!!!');
      //this.screen.victory();
      this.game.nextLevel();
    }
  }

  tearDown() {
    this.screen.pauseMenu.deactivate()
    clearInterval(this.renderInterval);
  }

  victory() {
    return this.player.x == this.goal.x && this.player.y == this.goal.y;
  }

  pause() {
    this.running = !this.running;
    this.screen.setState(this.running);
  }

  setLightLevels() {
    this.maze.setLightlevels(this.torches);
  }

  render() {
    this.screen.render();
  }
}
