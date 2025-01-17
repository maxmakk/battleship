<script lang="ts">
	import './../app.css';
	import Board from './board';
	import Computer from './computer';

	let isGameStarted = false;
	let winner = '';

	let player1 = new Board();
	player1.initGame();
	player1.autoPlacingShips();
	let player2 = new Board();
	player2.initGame();
	player2.autoPlacingShips();
	const randomize = () => {
		player1.initGame();
		player1.autoPlacingShips();
		player2.initGame();
		player2.autoPlacingShips();

		player1 = player1;
		player2 = player2;
	};
	let computer = new Computer();
	computer.init();

	let current = '';
	const PLAYER_1_MOVE = (x: number, y: number) => {
		if (!isGameStarted) return;
		if (current === 'p2') return;
		const r = player2.recieveAttack(x, y);
		if(r === null) return
		player2 = player2;
		if (r === 2 || r === 4) {
			if (player2.checkIfAllShipsSunk()) {
				isGameStarted = false;
				winner = 'player';
				return;
			}
			current = 'p1';
		} else {
			current = 'p2';
			setTimeout(() => {
				pcMove();
			}, 1000);
		}
	};

	const PLAYER_2_MOVE = (x: number, y: number) => {
		if (!isGameStarted) return;
		if (current === 'p1') return;
		const r = player1.recieveAttack(x, y);
		if(r === null) return
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
				isGameStarted = false;
				winner = 'computer';
				return;
			}
			current = 'p2';
			setTimeout(() => {
				pcMove();
			}, 1000);
		} else {
			computer.miss(x, y);
			current = 'p1';
		}
		console.log(computer);
	};
	const getChar = (x: number, y: number, b: Board) => {
		const s = b.findShip(x, y);
		let c = '';
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
	const pcMove = () => {
		const c = computer.getCoordsForShot();
		const event = new Event('click', { bubbles: true });
		const els = document.querySelector(`.player1 [data-x="${c![0]}"][data-y="${c![1]}"]`);
		els?.dispatchEvent(event);
	};
	const start = () => {
		isGameStarted = true;
		current = Math.random() >= 0.5 ? 'p1' : 'p2';
		if (current === 'p1') {
			console.log('your move');
		} else {
			pcMove();
			console.log('pc move');
		}
	};

	const rematch = () => {};
	let status = 'arrangment of the ships'
	const changeStatus = (s: string) => {
		status = ''
	}

</script>

<div class="container">
	<div class="status">{status}</div>
	<div class="fields" class:reversed={!isGameStarted}>
		<div class="player1" class:small={isGameStarted}>
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
							>{@html e}{@html s}{@html h}{@html m}{@html d}</button
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
						{@const s = player2.field[row][column] === 1 ? '&bull;' : ''}
						{@const h = player2.field[row][column] === 2 ? '&square;' : ''}
						{@const m = player2.field[row][column] === 3 ? '&times;' : ''}
						{@const d = player2.field[row][column] === 4 ? '&timesb;' : ''}
						<button class="square" onclick={() => PLAYER_1_MOVE(row, column)}
							>{@html e}{@html s}{@html h}{@html m}{@html d}</button
						>
					{/each}
				</div>
			{/each}
		</div>
	</div>

	<div class="buttons">
<button class="btn" onclick={randomize}>randomize</button>
<button class="btn" onclick={start}>play</button>
<button class="btn" onclick={rematch}>rematch</button>
	</div>

</div>

<style>
	.status {
		font-size: 0.5rem;
	}
	.row {
		display: grid;
		grid-template-columns: repeat(10, 1em);
	}

	.fields {
		display: flex;
		gap: 0.5em;
		flex-direction: column;
		align-items: end;
	}
	.reversed {
		
		flex-direction: column-reverse;
	}

	.small {
		font-size: 0.5rem;
	}

	.square {
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: inherit;
		font-size: inherit;
		background-color: transparent;
		border: none;
		width: 1em;
		height: 1em;
	}
	.square:hover {
		cursor: pointer;
		color: coral;
	}
</style>
