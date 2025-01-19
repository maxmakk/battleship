import type Ship from './ship';

class Computer {
	constructor(
		public opponent: number[][] = [],
		public randomCoords: number[][] = [],
		public calculatedCoords: number[][] = []
	) {
		this.opponent = [...Array(10)].map(() => Array(10).fill(0));
	}
	static getCoords = () => {
		const c = [];
		for (let i = 0; i < 10; i++) {
			for (let j = 0; j < 10; j++) {
				c.push([i, j]);
			}
		}
		return c;
	};
	static removeFromArray(s: number[][], [t, e]: number[]) {
		return s.filter((r) => r[0] !== t || r[1] !== e);
	}
	static shuffle(s: number[][]) {
		const t = [...s];
		let e = s.length,
			r;
		for (; e !== 0; ) {
			(r = Math.floor(Math.random() * e)), (e -= 1);
			const i = t[e];
			(t[e] = t[r]), (t[r] = i);
		}
		return t;
	}
	init() {
		this.opponent = [...Array(10)].map(() => Array(10).fill(0));
		(this.randomCoords = Computer.shuffle(Computer.getCoords())), (this.calculatedCoords = []);
	}
	getCoordsForShot() {
		return this.calculatedCoords.length > 0 ? this.calculatedCoords.pop() : this.randomCoords.pop();
	}
	miss(x: number, y: number) {
		this.opponent[x][y] = 3;
	}
	hit(x: number, y: number) {
		this.opponent[x][y] = 2;
		this.removeCoordsAroundHit(x, y);
		this.setCoordsForNextMove(x, y);
	}
	removeCoordsAroundShip(s: Ship) {
		const { size: t, x: e, y: r, dx: i, dy: o } = s;
		let n = [];
		t === 1
			? (n = [
					[e - 1, r],
					[e + 1, r],
					[e, r - 1],
					[e, r + 1]
				])
			: (n = [
					[e - i, r - o],
					[e + i * t, r + o * t]
				]),
			this.removeCoords(n);
	}
	setCoordsForNextMove(x: number, y: number) {
		const e = [
			[x - 1, y],
			[x + 1, y],
			[x, y - 1],
			[x, y + 1]
		];
		for (let r = 0; r < e.length; r += 1) {
			const i = e[r],
				o = i[0],
				n = i[1];
			o >= 0 &&
				o <= 9 &&
				n >= 0 &&
				n <= 9 &&
				this.opponent[o][n] !== 2 &&
				this.opponent[o][n] !== 3 &&
				this.calculatedCoords.push([o, n]);
			this.randomCoords = Computer.removeFromArray(this.randomCoords, [o, n]);
		}
	}
	removeCoordsAroundHit(x: number, y: number) {
		const c = [
			[x - 1, y - 1],
			[x - 1, y + 1],
			[x + 1, y - 1],
			[x + 1, y + 1]
		];
		this.removeCoords(c);
	}
	removeCoords(c: number[][]) {
		for (let t = 0; t < c.length; t += 1) {
			const x = c[t][0],
				y = c[t][1];
			if (x >= 0 && x <= 9 && y >= 0 && y <= 9) {
				this.removeCoordsFromArrays([x, y]);
				this.opponent[x][y] = 3;
			}
		}
	}
	removeCoordsFromArrays(c: number[]) {
		this.calculatedCoords.length > 0 &&
			(this.calculatedCoords = Computer.removeFromArray(this.calculatedCoords, c)),
			(this.randomCoords = Computer.removeFromArray(this.randomCoords, c));
	}
}

export default Computer;
