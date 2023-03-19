import { Maze, Tile, Point, ANGLES } from './maze';

export const euclid = (a: Point, b: Point) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
};

export const manhattan = (a: Point, b: Point): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

export class LinkedNode<T> {
  _data: T;
  parent: LinkedNode<T> | null;

  LinkedNode(data: T, parent: LinkedNode<T> | null) {
    this._data = data;
    this.parent = parent;
  }

  get data() {
    return this.data;
  }

  set data(data: T) {
    this._data = data;
  }
}

export class PathNode {
  point: Point;
  cost: number;
  parent: PathNode | undefined;

  constructor(point: Point, cost: number, parent: PathNode | undefined) {
    this.point = point;
    this.cost = cost;
    this.parent = parent;
  }

  find(p: Point): PathNode | undefined {
    if (this.point.x == p.x && this.point.y == p.y) {
      return this;
    }

    return this.parent?.find(p);
  }

  reverse(parent: PathNode | undefined = undefined): PathNode | undefined {
    let ret;
    if (this.parent) {
      ret = this.parent.reverse(this);
    }

    this.parent = parent;
    return ret ? ret : this;
  }
}

export const reversePath = (path: PathNode) => {

}

const sortAsc = (a: number, b: number): number => b - a;
const sortDesc = (a: number, b: number): number => a - b;

export class PriorityQueue<T> {
  queue: [number, T][];
  sort: (a: number, b: number) => number;

  constructor(sort = sortAsc) {
    this.queue = [];
    this.sort = sort;
  }

  push(priority: number, data: T) {
    if (!this.queue) {
      return;
    }
    this.queue.push([priority, data]);
    this.queue = this.queue.sort((a, b) => this.sort(a[0], b[0]));
  }

  pop(): T | undefined {
    let ret = this.queue.pop()
    return ret ? ret[1] : undefined;
  }

  empty() {
    return this.queue.length == 0;
  }
}

export const dijkstra = (maze: Maze, start: Point, end: Point, fov: number = 0) => {
  return pathFinding(maze, start, end, () => 0);
};

export const a_star = (maze: Maze, start: Point, end: Point, fov: number = 0, unsafe: Point[] = []) => {
  return pathFinding(maze, start, end, euclid, fov, unsafe);
};

const legal = (maze: Maze, node: Point, end: Point, fov: number, unsafe: Point[]) => {
  // Check if the node is close enough, or disregard if fov is 0
  let proximity = !fov || euclid(node, end) < fov;
  unsafe = unsafe.filter(u => u.x == node.x && u.y == node.y);

  return proximity && !unsafe.length;
}

export const pathFinding = (
    maze: Maze,
    start: Point,
    end: Point,
    h: (start: Point, end: Point) => number,
    fov: number = 0,
    unsafe: Point[] = [],
  ): PathNode | undefined => {
  let queue = new PriorityQueue<PathNode>();
  let startNode = new PathNode(start, 0, undefined);
  queue.push(0, startNode);

  let min = startNode;
  while(!queue.empty()) {
    let node = queue.pop();
    let x = node.point.x;
    let y = node.point.y;

    if (x == end.x && y == end.y) {
      //console.log("End of Pathfinding:", node);
      return node.reverse();
    }

    maze.legalNeighbors(x, y)
    .filter(next => legal(maze, next, end, fov, unsafe))
    .forEach(neighbor => {
      let new_cost = node!.cost + 1;

      let search_result = node.find(neighbor);
      if (!search_result || new_cost < search_result.cost) {
        let p = new PathNode(neighbor, new_cost, node);
        queue.push(new_cost + h(neighbor, end), p);

        // Keep track of the node closest to the end
        if (!min || euclid(p.point, end) < euclid(min.point, end)) {
          min = p;
        }
      }
    });
  }

  // If end is not found, return closest
  return min.reverse();
};

// TODO: See if both pathfinding functions can be sensibly combined
export const escape = (
  maze: Maze,
  start: Point,
  source: Point,
  fov: number = 4,
  unsafe: Point[] = [],
) => {
  let queue = new PriorityQueue<PathNode>(sortDesc);
  let startNode = new PathNode(start, 0, undefined);
  queue.push(0, startNode);

  let max = startNode;
  while (!queue.empty()) {
    let node = queue.pop();
    let x = node.point.x;
    let y = node.point.y;

    maze.legalNeighbors(x, y)
    .filter(next => legal(maze, next, source, fov, []))
    .forEach(neighbor => {
      //let neighbor = {x: x + ANGLES[a].x, y: y + ANGLES[a].y};
      let new_cost = node!.cost + 1;

      if (euclid(node.point, source) >= fov) {
        return node.reverse();
      }

      let search_result = node.find(neighbor);
      if (!search_result || new_cost < search_result.cost) {
        let p = new PathNode(neighbor, new_cost, node);
        queue.push(new_cost + euclid(neighbor, source), p);

        // Keep track of the node closest to the end
        if (!max || euclid(p.point, source) > euclid(max.point, source)) {
          max = p;
        }
      }
    });
  }

  return max.reverse();
};
