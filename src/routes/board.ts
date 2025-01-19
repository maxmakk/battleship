import Ship from './ship';

class Board {
	static BS_FIELD_EMPTY = 0; 
	static BS_FIELD_SHIP = 1; 
	static BS_FIELD_HIT = 2;
	static BS_FIELD_MISS = 3;
	static BS_FIELD_SHIPDESTROY = 4;

	static GAMEFIELD_WIDTH = 10;
	static GAMEFIELD_HEIGHT = 10;

	static DIRECTION_NORTHWARD = 0;
	static DIRECTION_SOUTHWARD = 1;
	static DIRECTION_WESTWARD = 2; 
	static DIRECTION_EASTWARD = 3; 

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
	public field: number[][];
	public ships: Ship[];

	constructor() {
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
	removeShip(x: number, y: number) {
		const f = this.findShip(x, y);
		if (f) {
			for (let i = 0; i < f.squares.length; i++) {
				const [k, j] = f.squares[i];
				this.field[k][j] = 0;
			}
			this.ships = this.ships.filter((ship) => f !== ship);
		}
	}
	checkIfAllShipsSunk() {
		return this.ships.every((s) => s.isSunk());
	}
	recieveAttack(x: number, y: number) {
		const r = this.field[x][y];
		if (r === 3 || r === 2 || r === 4) return null;
		if (r === 0) this.field[x][y] = 3;
		else if (r === 1) {
			this.field[x][y] = 2;
			const s = this.findShip(x, y);
			if (s) {
				s.hit();
				s.isSunk() && this.markEmptyCellsAroundShip(s.x, s.y, s.dx, s.dy, s.size),
					this.markEmptyCellsAroundHit(x, y);
				s.isSunk() && this.markSunkShip(s);
			}
		}
		return this.field[x][y];
	}
	markSunkShip(s: Ship) {
		s.squares.forEach(([x, y]) => {
			this.field[x][y] = 4;
		});
	}
	markEmptyCellsAroundHit(x: number, y: number) {
		const c = [
			[x - 1, y - 1],
			[x - 1, y + 1],
			[x + 1, y - 1],
			[x + 1, y + 1]
		];
		this.markEmptyCell(c);
	}
	markEmptyCellsAroundShip(x: number, y: number, dx: number, dy: number, size: number) {
		let c = [];
		size === 1
			? (c = [
					[x - 1, y],
					[x + 1, y],
					[x, y - 1],
					[x, y + 1]
				])
			: (c = [
					[x - dx, y - dy],
					[x + dx * size, y + dy * size]
				]),
			this.markEmptyCell(c);
	}
	markEmptyCell(c: number[][]) {
		for (let i = 0; i < c.length; i++) {
			const x = c[i][0],
				y = c[i][1];
			x >= 0 && x <= 9 && y >= 0 && y <= 9 && (this.field[x][y] = 3);
		}
	}
}

export default Board;
