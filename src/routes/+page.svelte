<script lang="ts">
	import './../app.css';
	import Board from './board';
	import Computer from './computer';
	import Ship from './ship';
	import { getChar } from '$lib';

	let isGameStarted = false;
	let ships: Ship[];
	let status = 'arrangment of the ships';
	let isDragged = false;
	let tempShip: null | Pick<Ship, 'size' | 'direction' | 'x' | 'y'> = null;
	let current = '';
	let computer = new Computer();

	let player1 = new Board();
	player1.initGame();
	player1.autoPlacingShips();
	ships = [...player1.ships];
	let player2 = new Board();
	player2.initGame();
	player2.autoPlacingShips();

	const PLAYER_1_MOVE = (x: number, y: number) => {
		if (!isGameStarted) return;
		if (current === 'p2' || current === '') return;
		const r = player2.recieveAttack(x, y);
		if (r === null) return;
		player2 = player2;
		if (r === 2 || r === 4) {
			if (player2.checkIfAllShipsSunk()) {
				current = '';
				changeStatus('player won');
				return;
			}
			current = 'p1';
			changeStatus('player move');
		} else {
			current = 'p2';
			changeStatus('computer move');
			setTimeout(() => {
				pcMove();
			}, 500);
		}
	};

	const PLAYER_2_MOVE = (x: number, y: number) => {
		if (!isGameStarted) return;
		if (current === 'p1' || current === '') return;
		const r = player1.recieveAttack(x, y);
		if (r === null) return;
		player1 = player1;
		if (r === 2 || r === 4) {
			computer.hit(x, y);
			if (r === 4) {
				const s = player1.findShip(x, y);
				if (s) {
					computer.removeCoordsAroundShip(s);
				}
			}
			if (player1.checkIfAllShipsSunk()) {
				current = '';
				changeStatus('computer won');
				return;
			}
			current = 'p2';
			changeStatus('computer move');
			setTimeout(() => {
				pcMove();
			}, 500);
		} else {
			computer.miss(x, y);
			current = 'p1';
			changeStatus('player move');
		}
	};
	const pcMove = () => {
		const c = computer.getCoordsForShot();
		const event = new Event('click', { bubbles: true });
		const els = document.querySelector(`.player [data-x="${c![0]}"][data-y="${c![1]}"]`);
		els?.dispatchEvent(event);
	};

	const randomize = () => {
		isGameStarted = false;
		changeStatus('arrangment of the ships');
		player1.initGame();
		player1.autoPlacingShips();
		player2.initGame();
		player2.autoPlacingShips();
		ships = [...player1.ships];

		player1 = player1;
		player2 = player2;
	};
	const start = () => {
		isGameStarted = true;
		computer.init();
		current = Math.random() >= 0.5 ? 'p1' : 'p2';
		if (current === 'p1') {
			changeStatus('player move');
		} else {
			setTimeout(() => {
				pcMove();
			}, 500);

			changeStatus('computer move');
		}
	};

	const rematch = () => {
		isGameStarted = false;
		changeStatus('arrangment of the ships');
		player1.initGame();
		ships.forEach((s) => player1.createShip(s.size, s.x, s.y, s.direction));
		player1 = player1;

		player2.initGame();
		player2.autoPlacingShips();
		player2 = player2;
	};

	const changeStatus = (s: string) => {
		status = s;
	};

	const selectShip = (x: number, y: number) => {
		if (isGameStarted) return;
		if (isDragged) return;
		isDragged = true;
		const ship = player1.findShip(x, y);
		if (ship) {
			tempShip = { ...ship };
			player1.removeShip(x, y);
		}
		player1 = player1;
	};
	const replaceShip = (event: MouseEvent) => {
		if (isGameStarted) return;
		if (!isDragged) return;
		const t = event.target;
		let x = null;
		let y = null;
		if (
			t instanceof Element &&
			t.closest('.player') &&
			t.getAttribute('data-x') &&
			t.getAttribute('data-y')
		) {
			x = Number(t.getAttribute('data-x'));
			y = Number(t.getAttribute('data-y'));
		}
		if (tempShip) {
			const { size: s, direction: d } = tempShip;
			if (x !== null && y !== null && player1.placingShip(s, x, y, d)) {
				player1.createShip(s, x, y, d);
			} else {
				player1.createShip(s, tempShip.x, tempShip.y, d);
			}
		}
		isDragged = false;
		tempShip = null;
		player1 = player1;
	};
	const rotateShip = (x: number, y: number) => {
		if (isGameStarted) return;
		const s = player1.findShip(x, y);
		if (s) {
			tempShip = { ...s };
			player1.removeShip(x, y);
			const { size: r, direction: i } = tempShip;
			for (let o = 0; o < 4; o += 1) {
				const n = (i + o + 1) % 4;
				if (player1.placingShip(r, tempShip.x, tempShip.y, n)) {
					player1.createShip(r, tempShip.x, tempShip.y, n);
					break;
				}
			}
			tempShip = null;
		}
		player1 = player1;
	};
</script>

<svelte:document onmouseup={replaceShip} />
<div class="container">
	<div class="status">{status}</div>
	<div class="fields" class:reversed={!isGameStarted}>
		<div class="player" class:small={isGameStarted}>
			{#each Array.from(Array(10).keys()) as row (row)}
				<div class="row">
					{#each Array.from(Array(10).keys()) as column (column)}
						{@const e = player1.field[row][column] === 0 ? '&bull;' : ''}
						{@const s = player1.field[row][column] === 1 ? getChar(row, column, player1) : ''}
						{@const h = player1.field[row][column] === 2 ? '&square;' : ''}
						{@const m = player1.field[row][column] === 3 ? '&times;' : ''}
						{@const d = player1.field[row][column] === 4 ? '&timesb;' : ''}
						<button
							class="square"
							data-x={row}
							data-y={column}
							onclick={() => PLAYER_2_MOVE(row, column)}
							oncontextmenu={(event) => {
								event.preventDefault();
								rotateShip(row, column);
							}}
							onmousedown={(event) => {
								if (event.button !== 0) return;
								selectShip(row, column);
							}}>{@html e}{@html s}{@html h}{@html m}{@html d}</button
						>
					{/each}
				</div>
			{/each}
		</div>

		<div class:small={!isGameStarted}>
			{#each Array.from(Array(10).keys()) as row (row)}
				<div class="row">
					{#each Array.from(Array(10).keys()) as column (column)}
						{@const e = player2.field[row][column] === 0 ? '&bull;' : ''}
						{@const n =
							player2.field[row][column] === 1 && status !== 'computer won' ? '&bull;' : ''}
						{@const s =
							player2.field[row][column] === 1 && status === 'computer won' ? '&square;' : ''}
						{@const h = player2.field[row][column] === 2 ? '&square;' : ''}
						{@const m = player2.field[row][column] === 3 ? '&times;' : ''}
						{@const d = player2.field[row][column] === 4 ? '&timesb;' : ''}
						<button class="square" onclick={() => PLAYER_1_MOVE(row, column)}
							>{@html e}{@html s}{@html h}{@html m}{@html d}{@html n}</button
						>
					{/each}
				</div>
			{/each}
		</div>
	</div>

	<div>
		<button disabled={isGameStarted} class="btn" onclick={randomize}>randomize</button>
		<button disabled={isGameStarted} class="btn" onclick={start}>play</button>
		<button class="btn" onclick={rematch}>rematch</button>
	</div>
</div>
