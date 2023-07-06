import React from "react";
import "./App.css";
import Collected from "./components/Collection";
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
  history: IPiece[][];
  historyNum: number;
  historyH1: number[];
  historyH2: number[];
  historyH3: any[];
  historyH4: any[];
  historyWhiteCollection: any[];
  historyBlackCollection: any[];
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
      history: [initializeBoard()],
      historyNum: 1,
      historyH1: [],
      historyH2: [],
      historyH3: [],
      historyH4: [],
      historyWhiteCollection: [],
      historyBlackCollection: [],
      mated: false,
    };
  }

  reset() {
    const isSameNum = this.state.historyNum - 1 === this.state.turnNum;
    if (isSameNum && this.state.turn === "b" && !this.state.mated) {
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
      history: [initializeBoard()],
      historyNum: 1,
      historyH1: [0],
      historyH2: [0],
      historyH3: [null],
      historyH4: [null],
      historyWhiteCollection: [],
      historyBlackCollection: [],
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

    const copyHistory = this.state.history.slice();
    const copyHistoryH1 = this.state.historyH1.slice();
    const copyHistoryH2 = this.state.historyH2.slice();
    const copyHistoryH3 = this.state.historyH3.slice();
    const copyHistoryH4 = this.state.historyH4.slice();
    const copyWhiteCollection = this.state.historyWhiteCollection.slice();
    const copyBlackCollection = this.state.historyBlackCollection.slice();
    copyHistory.push(squares);
    copyHistoryH1.push(start);
    copyHistoryH2.push(end);
    copyWhiteCollection.push(
      player === "w" ? collection : this.state.piecesCollectedByWhite
    );
    copyBlackCollection.push(
      player === "b" ? collection : this.state.piecesCollectedByBlack
    );

    const isKing = squares[end].ascii === "k" || squares[end].ascii === "K";

    if (isKing && Math.abs(end - start) === 2) {
      if (end === (squares[end].ascii === "k" ? 62 : 6)) {
        copyHistoryH3.push(end - 1);
        copyHistoryH4.push(end + 1);
      } else if (end === (squares[end].ascii === "k" ? 58 : 2)) {
        copyHistoryH3.push(end + 1);
        copyHistoryH4.push(end - 2);
      }
    } else {
      copyHistoryH3.push(null);
      copyHistoryH4.push(null);
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
      history: copyHistory,
      historyNum: this.state.historyNum + 1,
      historyH1: copyHistoryH1,
      historyH2: copyHistoryH2,
      historyH3: copyHistoryH3,
      historyH4: copyHistoryH4,
      historyWhiteCollection: copyWhiteCollection,
      historyBlackCollection: copyBlackCollection,
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

    if (this.state.historyNum - 1 !== this.state.turnNum) {
      return "currently viewing history";
    }

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

  viewHistory(direction: string) {
    const isSameNum = this.state.historyNum - 1 === this.state.turnNum;

    if (isSameNum && this.state.turn === "b" && !this.state.mated) {
      return "not allowed to view history";
    }

    let copySquares = [];
    let copyWhiteCollection = null;
    let copyBlackCollection = null;

    if (direction === "back_atw") {
      copySquares = this.state.history[0].slice();
      copyWhiteCollection = [];
      copyBlackCollection = [];
    } else if (
      direction === "next_atw" &&
      this.state.historyNum < this.state.turnNum + 1
    ) {
      copySquares = this.state.history[this.state.turnNum].slice();
      copyWhiteCollection =
        this.state.historyWhiteCollection[this.state.turnNum];
      copyBlackCollection =
        this.state.historyBlackCollection[this.state.turnNum];
    } else if (direction === "back" && this.state.historyNum - 2 >= 0) {
      copySquares = this.state.history[this.state.historyNum - 2].slice();
      copyWhiteCollection =
        this.state.historyWhiteCollection[this.state.historyNum - 2];
      copyBlackCollection =
        this.state.historyBlackCollection[this.state.historyNum - 2];
    } else if (
      direction === "next" &&
      this.state.historyNum <= this.state.turnNum
    ) {
      copySquares = this.state.history[this.state.historyNum].slice();
      copyWhiteCollection =
        this.state.historyWhiteCollection[this.state.historyNum];
      copyBlackCollection =
        this.state.historyBlackCollection[this.state.historyNum];
    } else {
      return "no more history";
    }

    copySquares = clearPossibleHighlight(copySquares);
    copySquares = clearHighlight(copySquares);

    for (let j = 0; j < 64; j++) {
      if (copySquares[j].ascii === (this.state.turn === "w" ? "k" : "K")) {
        copySquares[j].inCheck = false;
        copySquares[j].checked = false;

        break;
      }
    }

    const isStaleMate = stalemate(
      this.state.trueTurn,
      copySquares,
      this.state.passantPos,
      this.state.castlingConditions
    );

    const stale = isStaleMate && this.state.turn !== this.state.trueTurn;

    const isCheckMate = checkmate(
      this.state.trueTurn,
      copySquares,
      this.state.passantPos,
      this.state.castlingConditions
    );

    copySquares = highlightMate(
      this.state.trueTurn,
      copySquares,
      isCheckMate,
      stale
    );

    let index = null;

    if (direction === "back") {
      index = this.state.historyNum - 2;
    } else if (direction === "next") {
      index = this.state.historyNum;
    } else if (direction === "next_atw") {
      index = this.state.turnNum;
    }

    if (index !== 0 && index !== null) {
      if (this.state.historyH1[index] !== null) {
        copySquares[this.state.historyH1[index]].highlight = true;
        copySquares[this.state.historyH2[index]].highlight = true;
      }
      if (this.state.historyH3[index] != null) {
        copySquares[this.state.historyH3[index]].highlight = true;
        copySquares[this.state.historyH4[index]].highlight = true;
      }
    }

    let newHistoryNum =
      direction === "back"
        ? this.state.historyNum - 1
        : this.state.historyNum + 1;

    if (direction === "back_atw") {
      newHistoryNum = 1;
    }

    if (direction === "next_atw") {
      newHistoryNum = this.state.turnNum + 1;
    }

    this.setState({
      squares: copySquares,
      historyNum: newHistoryNum,
      turn: this.state.turn === "w" ? "b" : "w",
      piecesCollectedByWhite:
        copyWhiteCollection !== null
          ? copyWhiteCollection
          : this.state.piecesCollectedByWhite,
      piecesCollectedByBlack:
        copyBlackCollection !== null
          ? copyBlackCollection
          : this.state.piecesCollectedByBlack,
    });

    if (direction === "back_atw" || direction === "next_atw") {
      this.setState({
        turn: direction === "back_atw" ? "w" : this.state.trueTurn,
      });
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

        if (this.state.historyNum - 1 !== this.state.turnNum) {
          squareCursor = "not_allowed";
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
              <button
                className="reset_button history"
                onClick={() => this.viewHistory("back_atw")}
              >
                <p className="button_font">&lt;&lt;</p>
              </button>
              <button
                className="reset_button history"
                onClick={() => this.viewHistory("back")}
              >
                <p className="button_font">&lt;</p>
              </button>
              <button className="reset_button" onClick={() => this.reset()}>
                <p className="button_font">Restart Game</p>
              </button>
              <button
                className="reset_button history"
                onClick={() => this.viewHistory("next")}
              >
                <p className="button_font">&gt;</p>
              </button>
              <button
                className="reset_button history"
                onClick={() => this.viewHistory("next_atw")}
              >
                <p className="button_font">&gt;&gt;</p>
              </button>
            </div>

            <div className="mate_wrapper">
              <p className="small_font">
                {inCheck(
                  "w",
                  this.state.squares,
                  this.state.passantPos,
                  this.state.castlingConditions
                ) &&
                !checkmate(
                  "w",
                  this.state.squares,
                  this.state.passantPos,
                  this.state.castlingConditions
                )
                  ? "You are in check!"
                  : ""}
              </p>
              <p className="small_font">
                {inCheck(
                  "b",
                  this.state.squares,
                  this.state.passantPos,
                  this.state.castlingConditions
                ) &&
                !checkmate(
                  "b",
                  this.state.squares,
                  this.state.passantPos,
                  this.state.castlingConditions
                )
                  ? "Black player is in check."
                  : ""}
              </p>
              <p className="small_font">
                {checkmate(
                  "w",
                  this.state.squares,
                  this.state.passantPos,
                  this.state.castlingConditions
                )
                  ? "You lost by checkmate."
                  : ""}
              </p>
              <p className="small_font">
                {checkmate(
                  "b",
                  this.state.squares,
                  this.state.passantPos,
                  this.state.castlingConditions
                )
                  ? "You won by checkmate!"
                  : ""}
              </p>
              <p className="small_font">
                {stalemate(
                  "w",
                  this.state.squares,
                  this.state.passantPos,
                  this.state.castlingConditions
                ) && this.state.turn === "w"
                  ? "You are in stalemate. Game over."
                  : ""}
              </p>
              <p className="small_font">
                {stalemate(
                  "b",
                  this.state.squares,
                  this.state.passantPos,
                  this.state.castlingConditions
                ) && this.state.turn === "b"
                  ? "Black is in stalemate. Game over."
                  : ""}
              </p>
            </div>
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
