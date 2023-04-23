export default class Inputs {
  legal: string[] = ['w', 'a', 's', 'd', ' ', 'p'];
  pressed: string[] = [];
  down: string[] = [];
  up: string[] = [];

  update() {
    this.pressed = this.pressed
    .filter((btn, i) => this.pressed.indexOf(btn) == i)
    .concat(this.down)
    // If key is pressed and released this tick, remain until next tick
    .filter(btn => !this.up.includes(btn) || this.down.includes(btn));

    // Keys pressed and removed this tick are to be removed next tick
    this.up = this.up.filter(btn => this.down.includes(btn));
    this.down = [];
  }

  press(btn: string) {
    if (this.down.includes(btn) || !this.legal.includes(btn)) {
      return;
    }

    this.down.push(btn);
  }
  
  release(btn: string) {
    if (this.up.includes(btn)) {
      return;
    }

    this.up.push(btn);
  }
}
