import React from "react";
import "./App.css";
import MatchInfo from "./components/MatchInfo";
import clearPiecesHighlight from "./helpers/clearPiecesHighlight";
import getMoveConditions from "./helpers/getMoveConditions";
import initializeBoard from "./helpers/initializeBoard";
import isMoveAvailable from "./helpers/isMoveAvailable";
import { IPiece } from "./models/Piece";
import getMoves from "./helpers/getMoves";
import findBestMove from "./helpers/findBestMove";
import checkCastlingConditions from "./helpers/checkCastlingConditions";
import paintPossibleMoves from "./helpers/paintPossibleMoves";
import paintCheck from "./helpers/paintCheck";
import { defaultState } from "./models/defaultState";
import Board from "./components/Board";
import ResetButton from "./components/ResetButton";

export default class Game extends React.Component<{}, defaultState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      pieces: initializeBoard(),
      source: -1,
      turn: "w",
      firstPos: -1,
      secondPos: -1,
      repetition: 0,
      castlingConditions: {
        whiteKingHasMoved: false,
        blackKingHasMoved: false,
        leftBlackRookHasMoved: false,
        rightBlackRookHasMoved: false,
        leftWhiteRookHasMoved: false,
        rightWhiteRookHasMoved: false,
      },
      passantPos: -1,
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
      pieces: initializeBoard(),
      source: -1,
      turn: "w",
      firstPos: -1,
      secondPos: -1,
      repetition: 0,
      castlingConditions: {
        whiteKingHasMoved: false,
        blackKingHasMoved: false,
        leftBlackRookHasMoved: false,
        rightBlackRookHasMoved: false,
        leftWhiteRookHasMoved: false,
        rightWhiteRookHasMoved: false,
      },
      passantPos: -1,
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
      pieces: squares,
      source: -1,
      mated: checkMated || staleMated,
      turn: player === "b" ? "w" : "b",
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

    const { randStart, randEnd, newRepetition } = findBestMove(
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
      repetition: newRepetition,
    });
    this.executeMove("b", squares, randStart, randEnd);
  }

  handleClick(idx: number) {
    let copySquares = this.state.pieces.slice();

    if (this.state.mated) {
      return;
    }

    if (this.state.source === -1 && this.state.isBotRunning === false) {
      if (copySquares[idx].player !== this.state.turn) {
        return;
      }

      if (copySquares[idx].player !== null) {
        copySquares = paintPossibleMoves(
          copySquares,
          idx,
          this.state.passantPos,
          this.state.castlingConditions
        );

        this.setState({
          source: idx,
          pieces: copySquares,
        });
      }
    }

    if (this.state.source > -1) {
      const isCannibalism = copySquares[idx].player === this.state.turn;

      if (isCannibalism && this.state.source !== idx) {
        copySquares[this.state.source].highlight = false;

        copySquares = paintPossibleMoves(
          copySquares,
          idx,
          this.state.passantPos,
          this.state.castlingConditions
        );

        this.setState({
          source: idx,
          pieces: copySquares,
        });
      } else {
        const availableSquare = isMoveAvailable(
          this.state.source,
          idx,
          copySquares,
          this.state.passantPos,
          this.state.castlingConditions
        );

        if (!availableSquare) {
          copySquares = paintCheck(
            copySquares,
            idx,
            this.state.source,
            this.state.passantPos,
            this.state.castlingConditions
          );

          this.setState({
            source: -1,
            pieces: copySquares,
          });

          return;
        }

        this.executeMove("w", copySquares, this.state.source, idx);

        const searchDepth = 3;
        setTimeout(() => {
          this.executeBot(searchDepth, this.state.pieces);
        }, 700);
      }
    }
  }

  render() {
    return (
      <>
        <div className="left_screen ">
          <div className="side_box">
            <MatchInfo
              pieces={this.state.pieces}
              castlingConditions={this.state.castlingConditions}
              passantPos={this.state.passantPos}
              turn={this.state.turn}
              piecesCollectedByWhite={this.state.piecesCollectedByWhite}
              piecesCollectedByBlack={this.state.piecesCollectedByBlack}
            />

            <ResetButton onClick={this.reset.bind(this)} />
          </div>
        </div>

        <Board
          isBotRunning={this.state.isBotRunning}
          mated={this.state.mated}
          onClick={this.handleClick.bind(this)}
          statePieces={this.state.pieces}
        />
      </>
    );
  }
}
