import React from "react";
import "./App.css";
import MatchInfo from "./components/MatchInfo";
import Square from "./components/Square";
import { colNumbers, rowNumbers } from "./constants/colNumbersAndRowNumbers";
import calcSquareColor from "./helpers/calcSquareColor";
import clearPiecesHighlight from "./helpers/clearPiecesHighlight";
import getMoveConditions from "./helpers/getMoveConditions";
import initializeBoard from "./helpers/initializeBoard";
import isMoveAvailable from "./helpers/isMoveAvailable";
import { ICastlingConditions } from "./models/CastlingConditions";
import { IPiece } from "./models/Piece";
import getMoves from "./helpers/getMoves";
import findBestMove from "./helpers/findBestMove";
import checkCastlingConditions from "./helpers/checkCastlingConditions";
import paintPossibleMoves from "./helpers/paintPossibleMoves";
import paintCheck from "./helpers/paintCheck";

type MyComponentState = {
  squares: IPiece[];
  source: number;
  turn: string;
  trueTurn: string;
  turnNum: number;
  firstPos: number | null;
  secondPos: number | null;
  repetition: number;
  castlingConditions: ICastlingConditions;
  passantPos: number;
  isBotRunning: boolean;
  piecesCollectedByWhite: JSX.Element[];
  piecesCollectedByBlack: JSX.Element[];
  mated: boolean;
};

export default class Board extends React.Component<{}, MyComponentState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      squares: initializeBoard(),
      source: -1,
      turn: "w",
      trueTurn: "w",
      turnNum: 0,
      firstPos: null,
      secondPos: null,
      repetition: 0,
      castlingConditions: {
        whiteKingHasMoved: false,
        blackKingHasMoved: false,
        leftBlackRookHasMoved: false,
        rightBlackRookHasMoved: false,
        leftWhiteRookHasMoved: false,
        rightWhiteRookHasMoved: false,
      },
      passantPos: 65,
      isBotRunning: false,
      piecesCollectedByWhite: [],
      piecesCollectedByBlack: [],
      mated: false,
    };
  }

  reset() {
    if (this.state.turn === "b" && !this.state.mated) {
      return "cannot reset";
    }

    this.setState({
      squares: initializeBoard(),
      source: -1,
      turn: "w",
      trueTurn: "w",
      turnNum: 0,
      firstPos: null,
      secondPos: null,
      repetition: 0,
      castlingConditions: {
        whiteKingHasMoved: false,
        blackKingHasMoved: false,
        leftBlackRookHasMoved: false,
        rightBlackRookHasMoved: false,
        leftWhiteRookHasMoved: false,
        rightWhiteRookHasMoved: false,
      },
      passantPos: 65,
      isBotRunning: false,
      piecesCollectedByWhite: [],
      piecesCollectedByBlack: [],
      mated: false,
    });
  }

  executeMove(player: string, squares: IPiece[], start: number, end: number) {
    squares = clearPiecesHighlight(squares, player);

    const newCastlingConditions = checkCastlingConditions(
      squares,
      player,
      this.state.castlingConditions,
      start
    );

    this.setState({
      castlingConditions: newCastlingConditions,
    });

    const { checkMated, passant, staleMated, collection } = getMoveConditions(
      player,
      this.state.piecesCollectedByWhite,
      this.state.piecesCollectedByBlack,
      squares,
      start,
      end,
      this.state.passantPos,
      this.state.castlingConditions
    );

    this.setState({
      passantPos: passant,
      squares: squares,
      source: -1,
      turnNum: this.state.turnNum + 1,
      mated: checkMated || staleMated,
      turn: player === "b" ? "w" : "b",
      trueTurn: player === "b" ? "w" : "b",
      isBotRunning: player !== "b",
    });

    if (player === "b") {
      this.setState({
        firstPos: start,
        secondPos: end,
        piecesCollectedByBlack: collection,
      });
    } else {
      this.setState({
        piecesCollectedByWhite: collection,
      });
    }
  }

  executeBot(depth: number, squares: IPiece[]) {
    if (this.state.mated) {
      return "bot cannot run";
    }

    const { moves, starts, ends } = getMoves(
      squares,
      this.state.passantPos,
      this.state.castlingConditions
    );

    const { randStart, randEnd, repetition } = findBestMove(
      moves,
      this.state.repetition,
      this.state.firstPos,
      this.state.secondPos,
      squares,
      this.state.passantPos,
      depth,
      starts,
      ends,
      this.state.castlingConditions
    );

    this.setState({
      repetition: repetition,
    });
    this.executeMove("b", squares, randStart, randEnd);
  }

  handleClick(i: number) {
    let copySquares = this.state.squares.slice();

    if (this.state.mated) {
      return "game-over";
    }

    if (this.state.source === -1 && this.state.isBotRunning === false) {
      if (copySquares[i].player !== this.state.turn) {
        return;
      }

      if (copySquares[i].player !== null) {
        copySquares = paintPossibleMoves(
          copySquares,
          i,
          this.state.passantPos,
          this.state.castlingConditions
        );

        this.setState({
          source: i,
          squares: copySquares,
        });
      }
    }

    if (this.state.source > -1) {
      const isCannibalism = copySquares[i].player === this.state.turn;

      if (isCannibalism && this.state.source !== i) {
        copySquares[this.state.source].highlight = false;

        copySquares = paintPossibleMoves(
          copySquares,
          i,
          this.state.passantPos,
          this.state.castlingConditions
        );

        this.setState({
          source: i,
          squares: copySquares,
        });
      } else {
        const availableSquare = isMoveAvailable(
          this.state.source,
          i,
          copySquares,
          this.state.passantPos,
          this.state.castlingConditions
        );

        if (!availableSquare) {
          copySquares = paintCheck(
            copySquares,
            i,
            this.state.source,
            this.state.passantPos,
            this.state.castlingConditions
          );

          this.setState({
            source: -1,
            squares: copySquares,
          });

          return "invalid move";
        }

        this.executeMove("w", copySquares, this.state.source, i);

        const searchDepth = 3;
        setTimeout(() => {
          this.executeBot(searchDepth, this.state.squares);
        }, 700);
      }
    }
  }

  render() {
    const board = [];

    for (let i = 0; i < 8; i++) {
      const squareRows = [];

      for (let j = 0; j < 8; j++) {
        let squareCorner = null;
        if (i === 0 && j === 0) {
          squareCorner = " top_left_square ";
        } else if (i === 0 && j === 7) {
          squareCorner = " top_right_square ";
        } else if (i === 7 && j === 0) {
          squareCorner = " bottom_left_square ";
        } else if (i === 7 && j === 7) {
          squareCorner = " bottom_right_square ";
        } else {
          squareCorner = " ";
        }

        const copySquares = this.state.squares.slice();
        let squareColor = calcSquareColor(i, j, copySquares);
        let squareCursor = "pointer";

        if (copySquares[i * 8 + j].player !== "w") {
          squareCursor = "default";
        }

        if (this.state.isBotRunning && !this.state.mated) {
          squareCursor = "isBotRunning";
        }

        if (this.state.mated) {
          squareCursor = "default";
        }

        squareRows.push(
          <Square
            key={i * 8 + j}
            value={copySquares[i * 8 + j]}
            color={squareColor}
            corner={squareCorner}
            cursor={squareCursor}
            onClick={() => this.handleClick(i * 8 + j)}
          />
        );
      }
      board.push(<div key={i}>{squareRows}</div>);
    }

    return (
      <div>
        <div className="left_screen ">
          <div className="side_box">
            <MatchInfo
              pieces={this.state.squares}
              castlingConditions={this.state.castlingConditions}
              passantPos={this.state.passantPos}
              turn={this.state.turn}
              piecesCollectedByWhite={this.state.piecesCollectedByWhite}
              piecesCollectedByBlack={this.state.piecesCollectedByBlack}
            />

            <div className="button_wrapper">
              <button className="reset_button" onClick={() => this.reset()}>
                <p className="button_font">Restart Game</p>
              </button>
            </div>
          </div>
        </div>

        <div className="right_screen">
          <div className="row_label"> {rowNumbers} </div>
          <div className="table"> {board} </div>
          <div className="col_label"> {colNumbers} </div>
        </div>
      </div>
    );
  }
}
