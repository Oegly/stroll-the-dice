export default class Inputs {
  legal: string[] = ['w', 'a', 's', 'd', ' '];
  pressed: string[] = [];
  
  press(btn: string) {
    if (this.pressed.includes(btn)) {
      return;
    }
  
    this.pressed.push(btn);
  }
  
  release(btn: string) {
    let i = this.pressed.indexOf(btn);
  
    if (i > -1) {
      this.pressed.splice(i, 1);
    }
  }
}

