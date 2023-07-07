import React from "react";
import "./App.css";
import MatchInfo from "./components/MatchInfo";
import Square from "./components/Square";
import { colNumbers, rowNumbers } from "./constants/colNumbersAndRowNumbers";
import calcSquareColor from "./helpers/calcSquareColor";
import clearCheckHighlight from "./helpers/clearCheckHighlight";
import clearPossibleHighlight from "./helpers/clearPossibleHighlight";
import clearPiecesHighlight from "./helpers/clearPiecesHighlight";
import getMoveConditions from "./helpers/getMoveConditions";
import inCheck from "./helpers/inCheck";
import initializeBoard from "./helpers/initializeBoard";
import isMoveAvailable from "./helpers/isMoveAvailable";
import makeMove from "./helpers/makeMove";
import minimax from "./helpers/minimax";
import { ICastlingConditions } from "./models/CastlingConditions";
import { IPiece } from "./models/Piece";
import getMoves from "./helpers/getMoves";

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

    if (squares[start].ascii === (player === "w" ? "k" : "K")) {
      if (player === "w") {
        this.setState({
          castlingConditions: {
            ...this.state.castlingConditions,
            whiteKingHasMoved: true,
          },
        });
      } else {
        this.setState({
          castlingConditions: {
            ...this.state.castlingConditions,
            whiteKingHasMoved: true,
          },
        });
      }
    }

    if (squares[start].ascii === (player === "w" ? "r" : "R")) {
      if (start === (player === "w" ? 56 : 0)) {
        if (player === "w") {
          this.setState({
            castlingConditions: {
              ...this.state.castlingConditions,
              whiteKingHasMoved: true,
            },
          });
        } else {
          this.setState({
            castlingConditions: {
              ...this.state.castlingConditions,
              whiteKingHasMoved: true,
            },
          });
        }
      } else if (start === (player === "w" ? 63 : 7)) {
        if (player === "w") {
          this.setState({
            castlingConditions: {
              ...this.state.castlingConditions,
              whiteKingHasMoved: true,
            },
          });
        } else {
          this.setState({
            castlingConditions: {
              ...this.state.castlingConditions,
              whiteKingHasMoved: true,
            },
          });
        }
      }
    }

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

    let randStart = 100;
    let randEnd = 100;
    let bestValue = -9999;

    for (let i = 0; i < moves.length; i += 2) {
      let start = moves[i];
      let end = moves[i + 1];

      if (
        moves.length > 2 &&
        this.state.repetition >= 2 &&
        start === this.state.secondPos &&
        end === this.state.firstPos
      ) {
        this.setState({
          repetition: 0,
        });
      } else {
        const testSquares = squares.slice();

        const testSquares_2 = makeMove(
          testSquares,
          start,
          end,
          this.state.passantPos
        );

        let passant_pos = 65;

        if (
          testSquares[start].ascii === "P" &&
          start >= 8 &&
          start <= 15 &&
          end - start === 16
        ) {
          passant_pos = end;
        }

        let board_eval = minimax(
          depth - 1,
          false,
          -1000,
          1000,
          testSquares_2,
          starts,
          ends,
          this.state.passantPos,
          this.state.castlingConditions,
          passant_pos
        );
        
        if (board_eval >= bestValue) {
          bestValue = board_eval;
          randStart = start;
          randEnd = end;
        }
      }
    }

    if (randEnd !== 100) {
      if (
        randStart === this.state.secondPos &&
        randEnd === this.state.firstPos
      ) {
        let reps = this.state.repetition + 1;
        this.setState({
          repetition: reps,
        });
      } else {
        this.setState({
          repetition: 0,
        });
      }

      this.executeMove("b", squares, randStart, randEnd);
    }
  }

  handleClick(i: number) {
    let copySquares = this.state.squares.slice();

    if (this.state.mated) {
      return "game-over";
    }

    if (this.state.source === -1 && this.state.isBotRunning === false) {
      if (copySquares[i].player !== this.state.turn) {
        return -1;
      }

      if (copySquares[i].player !== null) {
        copySquares = clearCheckHighlight(copySquares, "w").slice();
        copySquares[i].highlight = true;

        for (let j = 0; j < 64; j++) {
          if (
            isMoveAvailable(
              i,
              j,
              copySquares,
              this.state.passantPos,
              this.state.castlingConditions
            )
          )
            copySquares[j].possible = true;
        }

        this.setState({
          source: i,
          squares: copySquares,
        });
      }
    }

    if (this.state.source > -1) {
      const cannibalism = copySquares[i].player === this.state.turn;

      if (cannibalism && this.state.source !== i) {
        copySquares[i].highlight = true;
        copySquares[this.state.source].highlight = false;
        copySquares = clearPossibleHighlight(copySquares);

        for (let j = 0; j < 64; j++) {
          if (
            isMoveAvailable(
              i,
              j,
              copySquares,
              this.state.passantPos,
              this.state.castlingConditions
            )
          )
            copySquares[j].possible = true;
        }
        this.setState({
          source: i,
          squares: copySquares,
        });
      } else {
        if (
          !isMoveAvailable(
            this.state.source,
            i,
            copySquares,
            this.state.passantPos,
            this.state.castlingConditions
          )
        ) {
          copySquares[this.state.source].highlight = false;
          copySquares = clearPossibleHighlight(copySquares).slice();
          if (
            i !== this.state.source &&
            inCheck(
              "w",
              copySquares,
              this.state.passantPos,
              this.state.castlingConditions
            )
          ) {
            for (let j = 0; j < 64; j++) {
              if (copySquares[j].ascii === "k") {
                copySquares[j].inCheck = true;
                break;
              }
            }
          }
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
