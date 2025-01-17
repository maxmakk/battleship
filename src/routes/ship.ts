class Ship {
	public hits: number;
	public squares: number[][];
	constructor(
		public size: number,
		public x: number,
		public y: number,
		public dx: number,
		public dy: number,
		public direction: number
	) {
		this.size = size;
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.direction = direction;

		this.hits = 0;
		this.squares = [];
	}

	hit() {
		this.hits++;
	}

	isSunk() {
		return this.hits === this.squares.length;
	}

	setCoords(x: number, y: number) {
		this.squares.push([x, y]);
	}
}

export default Ship;
