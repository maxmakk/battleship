import Board from "./board";


class Game {
  public player1: Board
  public player2: Board

  constructor(serialized: string | undefined = undefined) {
    if (serialized) {
      const game: Game  =JSON.parse(serialized)
      this.player1 = game.player1
      this.player2 = game.player2
      console.log(this.player1)
    } else {
      this.player1 = new Board()
      this.player2 = new Board()
      this.player1.initGame()
      this.player1.autoPlacingShips()


      this.player2.initGame()
      this.player2.autoPlacingShips()
    }
  }
}

export default Game
