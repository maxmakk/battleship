import Ship from './ship';

class Board {
  static BS_FIELD_EMPTY = 0; // Empty field
  static BS_FIELD_SHIP = 1; // Ship field
  static BS_FIELD_HIT = 2; // Hit field
  static BS_FIELD_MISS = 3; // Miss field
  static BS_FIELD_SHIPDESTROY = 4; // Hit in Ship

  static GAMEFIELD_WIDTH = 10;
  static GAMEFIELD_HEIGHT = 10;

  static DIRECTION_NORTHWARD = 0; //Northward
  static DIRECTION_SOUTHWARD = 1; //Southward
  static DIRECTION_WESTWARD = 2; //Westward
  static DIRECTION_EASTWARD = 3; //Eastward

  static SHIPS = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  static MAX_ATTEMPT = 300;

  static getRnd(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getDirectionCoords(direction: number) {
    let x = 0,
      y = 0;
    switch (direction) {
      case Board.DIRECTION_NORTHWARD:
        (x = -1), (y = 0);
        break;
      case Board.DIRECTION_SOUTHWARD:
        (x = 1), (y = 0);
        break;
      case Board.DIRECTION_WESTWARD:
        (x = 0), (y = -1);
        break;
      case Board.DIRECTION_EASTWARD:
        (x = 0), (y = 1);
        break;
      default:
        (x = 0), (y = -1);
    }
    return { dx: x, dy: y };
  }
  public field: number[][]
  public ships: Ship[]

  constructor(
  ) {
    this.field = [...Array(10)].map(() => Array(10));
    this.ships = [];
  }

  clearField() {
    for (let i = 0; i < Board.GAMEFIELD_WIDTH; i++) {
      for (let j = 0; j < Board.GAMEFIELD_HEIGHT; j++) {
        this.field[i][j] = Board.BS_FIELD_EMPTY;
      }
    }
  }
  initGame() {
    this.clearField();
    this.ships = [];
  }

  placingShip(size: number, x: number, y: number, dir: number) {
    const { dx, dy } = Board.getDirectionCoords(dir);
    if (
      (dir === Board.DIRECTION_NORTHWARD && x - size < -1) ||
      (dir === Board.DIRECTION_SOUTHWARD && x + size > 10) ||
      (dir === Board.DIRECTION_WESTWARD && y - size < -1) ||
      (dir === Board.DIRECTION_EASTWARD && y + size > 10)
    )
      return false;

    let dirs = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 0],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1]
    ];

    for (let i = 0; i < size; i++) {
      if (i === 1) {
        if (dir === Board.DIRECTION_NORTHWARD) {
          dirs = [
            [-1, -1],
            [-1, 0],
            [-1, 1]
          ];
        }
        if (dir === Board.DIRECTION_SOUTHWARD) {
          dirs = [
            [1, -1],
            [1, 0],
            [1, 1]
          ];
        }
        if (dir === Board.DIRECTION_WESTWARD) {
          dirs = [
            [-1, -1],
            [0, -1],
            [1, -1]
          ];
        }
        if (dir === Board.DIRECTION_EASTWARD) {
          dirs = [
            [-1, 1],
            [0, 1],
            [1, 1]
          ];
        }
      }
      for (let j = 0; j < dirs.length; j++) {
        const nextX = x + i * dx + dirs[j][0];
        const nextY = y + i * dy + dirs[j][1];
        if (nextX >= 0 && nextX < 10 && nextY >= 0 && nextY < 10 && this.field[nextX][nextY] !== 0)
          return false;
      }
    }

    return true;
  }

  createShip(s: number, x: number, y: number, d: number) {
    const { dx, dy } = Board.getDirectionCoords(d);
    const ship = new Ship(s, x, y, dx, dy, d);
    for (let i = 0; i < s; i++) {
      this.field[x][y] = 1;
      ship.setCoords(x, y);
      x += dx;
      y += dy;
    }
    this.ships.push(ship);
  }

  autoPlacingShips() {
    let ship = 0;
    let attempt = 0;
    while (ship !== 10) {
      for (let i = 0; i < Board.SHIPS.length; i++) {
        let putFlag = false;
        while (!putFlag) {
          const rndDir = Board.getRnd(0, 3);
          let x = 0;
          let y = 0;

          if (rndDir === Board.DIRECTION_NORTHWARD) {
            x = Board.getRnd(-1 + Board.SHIPS[i], 9);
            y = Board.getRnd(0, 9);
          }
          if (rndDir === Board.DIRECTION_EASTWARD) {
            x = Board.getRnd(0, 9);
            y = Board.getRnd(0, 10 - Board.SHIPS[i]);
          }
          if (rndDir === Board.DIRECTION_SOUTHWARD) {
            x = Board.getRnd(0, 10 - Board.SHIPS[i]);
            y = Board.getRnd(0, 9);
          }
          if (rndDir === Board.DIRECTION_WESTWARD) {
            x = Board.getRnd(0, 9);
            y = Board.getRnd(-1 + Board.SHIPS[i], 9);
          }
          if (this.placingShip(Board.SHIPS[i], x, y, rndDir)) {
            this.createShip(Board.SHIPS[i], x, y, rndDir);
            putFlag = true;
            ship += 1;
            break;
          }
          attempt += 1;
          if (attempt > Board.MAX_ATTEMPT) break;
        }
        if (attempt > Board.MAX_ATTEMPT) break;
      }
      if (attempt > Board.MAX_ATTEMPT) break;
    }
  }
  findShip(x: number, y: number) {
    for (let i = 0; i < this.ships.length; i++) {
      if (this.ships[i].squares.some((s) => s[0] === x && s[1] === y)) {
        return this.ships[i];
      }
    }
    return null;
  }
  removeShip(s: number, t: number) {
    const e = this.findShip(s, t);
    if (e) {
      for (let r = 0; r < e.squares.length; r += 1) {
        const [i, o] = e.squares[r];
        this.field[i][o] = 0;
      }
      this.ships = this.ships.filter((r) => e !== r);
    }
  }
  checkIfAllShipsSunk() {
    return this.ships.every(s => s.isSunk())
  }
  recieveAttack(s: number, t: number) {
    const e = this.field[s][t];
    if(e === 3 || e === 2 || e === 4) return null
    if (e === 0) this.field[s][t] = 3;
    else if (e === 1) {
      this.field[s][t] = 2;
      const r = this.findShip(s, t);
      if (r) {

        r.hit()
        r.isSunk() && this.markEmptyCellsAroundShip(r.x, r.y, r.dx, r.dy, r.size), this.markEmptyCellsAroundHit(s, t)
        r.isSunk() && this.markSunkShip(r)

      }
    }
    return this.field[s][t]
  }
  markSunkShip(s: Ship) {
    s.squares.forEach(([x, y]) => {
      this.field[x][y] = 4
    })

  }
  markEmptyCellsAroundHit(s: number, t: number) {
    const e = [
      [s - 1, t - 1],
      [s - 1, t + 1],
      [s + 1, t - 1],
      [s + 1, t + 1]
    ];
    this.markEmptyCell(e)
  }
  markEmptyCellsAroundShip(s: number, t: number, e: number, r: number, i: number) {
    let o = [];
    i === 1 ? o = [
      [s - 1, t],
      [s + 1, t],
      [s, t - 1],
      [s, t + 1]
    ] : o = [
      [s - e, t - r],
      [s + e * i, t + r * i]
    ], this.markEmptyCell(o)
  }
  markEmptyCell(s: number[][]) {
    for (let t = 0; t < s.length; t += 1) {
      const e = s[t][0],
        r = s[t][1];
      e >= 0 && e <= 9 && r >= 0 && r <= 9 && (this.field[e][r] = 3)
    }
  }
}

export default Board;
