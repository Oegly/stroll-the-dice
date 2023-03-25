import { Point } from "../maze";

export class PropertyMatrix<T> {
  matrix: T[][];

  constructor(
    width: number,
    height: number,
    init: (matrix: T[][]) => T[][],
    startValue: T,
  ) {
    let matrix: T[][] = Array(width).fill([]).map(
      () => Array(height).fill(startValue)
    );

    this.matrix = init(matrix);
  }

  withinBounds(point: Point) {
    return point.x >= 0 && point.x < this.matrix.length &&
    point.y >= 0 && point.y < this.matrix[0].length;
  }

  find(x: number, y: number): T {
    return this.matrix[x][y];
  }

  filter(f: (predicate: T, index: Point) => boolean): T[] {
    return this.matrix.flatMap(
      (row, x) => row.filter((data, y) => f(data, {x: x, y: y}))
    );
  }

  forEach(f: (predicate: T, index: Point) => void) {
    this.matrix.flatMap(
      (row, x) => row.forEach((data, y) => f(data, {x: x, y: y}))
    );
  }
}
