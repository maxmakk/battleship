import type Board from '../routes/board';
export const getChar = (x: number, y: number, b: Board) => {
	const s = b.findShip(x, y);
	let c = '&bull;';
	const d = s?.direction;
	if (d === 0) {
		c = '&#x25B2;';
	}
	if (d === 1) {
		c = '&#x25BC;';
	}
	if (d === 2) {
		c = '&#x25C0;';
	}
	if (d === 3) {
		c = '&#x25B6;';
	}
	return c;
};
