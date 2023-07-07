import React from "react";
import "./App.css";
import Collected from "./components/Collection";
import MateWrapper from "./components/MateWrapper";
import Square from "./components/Square";
import { colNumbers, rowNumbers } from "./constants/colNumbersAndRowNumbers";
import calcSquareColor from "./helpers/calcSquareColor";
import checkmate from "./helpers/checkmate";
import clearCheckHighlight from "./helpers/clearCheckHighlight";
import clearHighlight from "./helpers/clearHighlight";
import clearPossibleHighlight from "./helpers/clearPossibleHighlight";
import highlightMate from "./helpers/highlightMate";
import inCheck from "./helpers/inCheck";
import initializeBoard from "./helpers/initializeBoard";
import isMoveAvailable from "./helpers/isMoveAvailable";
import makeMove from "./helpers/makeMove";
import minimax from "./helpers/minimax";
import shuffle from "./helpers/shuffle";
import stalemate from "./helpers/stalemate";
import { ICastlingConditions } from "./models/CastlingConditions";
import { IPiece } from "./models/Piece";
import FillerPiece from "./pieces/FillerPiece";

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
    squares = clearHighlight(squares);

    if (player === "w") {
      squares = clearPossibleHighlight(squares);
      for (let j = 0; j < 64; j++) {
        if (squares[j].ascii === "k") {
          squares[j].inCheck = false;
          break;
        }
      }
    }

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

    const collection =
      player === "w"
        ? this.state.piecesCollectedByWhite.slice()
        : this.state.piecesCollectedByBlack.slice();

    if (squares[end].ascii !== null) {
      collection.push(<Collected value={squares[end]} />);
    }

    if (squares[start].ascii === (player === "w" ? "p" : "P")) {
      if (end - start === (player === "w" ? -9 : 7)) {
        if (start - 1 === this.state.passantPos) {
          collection.push(<Collected value={squares[start - 1]} />);
          squares[start - 1] = new FillerPiece(null);
        }
      } else if (end - start === (player === "w" ? -7 : 9)) {
        if (start + 1 === this.state.passantPos) {
          collection.push(<Collected value={squares[start + 1]} />);
          squares[start + 1] = new FillerPiece(null);
        }
      }
    }

    squares = makeMove(squares, start, end, this.state.passantPos);

    const passant_true =
      player === "w"
        ? squares[end].ascii === "p" &&
          start >= 48 &&
          start <= 55 &&
          end - start === -16
        : squares[end].ascii === "P" &&
          start >= 8 &&
          start <= 15 &&
          end - start === 16;
    const passant = passant_true ? end : 65;

    if (player === "w") {
      squares = highlightMate(
        "b",
        squares,
        checkmate(
          "b",
          squares,
          this.state.passantPos,
          this.state.castlingConditions
        ),
        stalemate(
          "b",
          squares,
          this.state.passantPos,
          this.state.castlingConditions
        )
      ).slice();
    } else {
      squares = highlightMate(
        "w",
        squares,
        checkmate(
          "w",
          squares,
          this.state.passantPos,
          this.state.castlingConditions
        ),
        stalemate(
          "w",
          squares,
          this.state.passantPos,
          this.state.castlingConditions
        )
      ).slice();
    }

    let checkMated =
      checkmate(
        "w",
        squares,
        this.state.passantPos,
        this.state.castlingConditions
      ) ||
      checkmate(
        "b",
        squares,
        this.state.passantPos,
        this.state.castlingConditions
      );
    let staleMated =
      (stalemate(
        "w",
        squares,
        this.state.passantPos,
        this.state.castlingConditions
      ) &&
        player === "b") ||
      (stalemate(
        "b",
        squares,
        this.state.passantPos,
        this.state.castlingConditions
      ) &&
        player === "w");

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

    let randStart = 100;
    let randEnd = 100;
    let starts = [];
    let ends = [];

    for (let i = 0; i < 64; i++) {
      starts.push(i);
      ends.push(i);
    }

    starts = shuffle(starts);
    ends = shuffle(ends);

    let moves = [];
    for (let i = 0; i < 64; i++) {
      let start = starts[i];
      let isBlackPiece =
        squares[start].ascii !== null && squares[start].player === "b";
      if (isBlackPiece) {
        for (let j = 0; j < 64; j++) {
          let end = ends[j];
          if (
            isMoveAvailable(
              start,
              end,
              squares,
              this.state.passantPos,
              this.state.castlingConditions
            )
          ) {
            moves.push(start);
            moves.push(end);
          }
        }
      }
    }

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
        )
          passant_pos = end;

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
        copySquares = clearPossibleHighlight(copySquares).slice();
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
      <div className="bounceInDown">
        <div className="left_screen bounceInDown">
          <div className="side_box">
            <div className="content">
              <p className="header_font">ReactJS Chess</p>
              <p className="medium_font">Play against our friendly bot!</p>
            </div>
          </div>

          <div className="side_box">
            <div className="content title">
              <p className="header_2_font">Match Information</p>
            </div>

            <div className="wrapper">
              <div className="player_box">
                <p className="medium_font">White (You)</p>
                {this.state.piecesCollectedByWhite}
              </div>
              <div className="player_box black_player_color">
                <p className="medium_font">Black (Bot)</p>
                {this.state.piecesCollectedByBlack}
              </div>
            </div>
            <div className="wrapper">
              {this.state.turn === "w" ? (
                <div className="highlight_box"></div>
              ) : (
                <div className="highlight_box transparent"></div>
              )}
              {this.state.turn === "b" ? (
                <div className="highlight_box"></div>
              ) : (
                <div className="highlight_box transparent"></div>
              )}
            </div>

            <div className="button_wrapper">
              <button className="reset_button" onClick={() => this.reset()}>
                <p className="button_font">Restart Game</p>
              </button>
            </div>

            <MateWrapper
              pieces={this.state.squares}
              castlingConditions={this.state.castlingConditions}
              passantPos={this.state.passantPos}
              turn={this.state.turn}
            />
          </div>
        </div>

        <div className="right_screen bounceInDown">
          <div className="row_label"> {rowNumbers} </div>
          <div className="table"> {board} </div>
          <div className="col_label"> {colNumbers} </div>
        </div>
      </div>
    );
  }
}
