import { useState, JSX } from "react";
import "./App.css";
import clearPiecesHighlight from "./helpers/UI/clearPiecesHighlight";
import getMoveConditions from "./helpers/gameLogic/getMoveConditions";
import initializeBoard from "./helpers/board/initializeBoard";
import isMoveAvailable from "./helpers/gameLogic/isMoveAvailable";
import { IPiece } from "./models/Piece";
import getMoves from "./helpers/bot/getMoves";
import findBestMove from "./helpers/bot/findBestMove";
import checkCastlingConditions from "./helpers/gameLogic/checkCastlingConditions";
import paintPossibleMoves from "./helpers/UI/paintPossibleMoves";
import paintCheck from "./helpers/UI/paintCheck";
import Board from "./components/Board";
import { defaultCastlingConditions } from "./constants/castlingConditions";
import LeftScreen from "./components/LeftScreen";
import { EPlayer } from "./models/enums/Player.enum";
import { EPieceAsciis } from "./models/enums/PieceAsciis.enum";

const Game: React.FC = () => {
  const [pieces, setPieces] = useState<IPiece[]>(initializeBoard());
  const [source, setSource] = useState<number>(-1);
  const [turn, setTurn] = useState<string>(EPlayer.white);
  const [firstPos, setFirstPos] = useState<number>(-1);
  const [secondPos, setSecondPos] = useState<number>(-1);
  const [repetition, setRepetition] = useState<number>(0);
  const [castlingConditions, setCastlingConditions] = useState(
    defaultCastlingConditions
  );
  const [passantPos, setPassantPos] = useState<number>(-1);
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);
  const [piecesCollectedByWhite, setPiecesCollectedByWhite] = useState<
    JSX.Element[]
  >([]);
  const [piecesCollectedByBlack, setPiecesCollectedByBlack] = useState<
    JSX.Element[]
  >([]);
  const [mated, setMated] = useState<boolean>(false);

  const reset = () => {
    setPieces(initializeBoard());
    setSource(-1);
    setTurn(EPlayer.white);
    setFirstPos(-1);
    setSecondPos(-1);
    setRepetition(0);
    setCastlingConditions(defaultCastlingConditions);
    setPassantPos(-1);
    setIsBotRunning(false);
    setPiecesCollectedByWhite([]);
    setPiecesCollectedByBlack([]);
    setMated(false);
  };

  const executeMove = (
    player: string,
    squares: IPiece[],
    start: number,
    end: number
  ) => {
    let updatedSquares = clearPiecesHighlight(squares, player);

    const kingASCII =
      player === EPlayer.white
        ? EPieceAsciis.whiteKing
        : EPieceAsciis.blackKing;

    const rookASCII =
      player === EPlayer.white
        ? EPieceAsciis.whiteRook
        : EPieceAsciis.blackRook;

    const isKing = pieces[start].ascii === rookASCII;
    const isRook = pieces[start].ascii === kingASCII;

    if (isKing || isRook) {
      const newCastlingConditions = checkCastlingConditions(
        updatedSquares,
        player,
        castlingConditions,
        start
      );

      setCastlingConditions(newCastlingConditions);
    }

    const { checkMated, passant, staleMated, collection } = getMoveConditions(
      player,
      piecesCollectedByWhite,
      piecesCollectedByBlack,
      updatedSquares,
      start,
      end,
      passantPos,
      castlingConditions
    );

    setPassantPos(passant);
    setPieces(updatedSquares);
    setSource(-1);
    setMated(checkMated || staleMated);
    setTurn(player === EPlayer.black ? EPlayer.white : EPlayer.black);
    setIsBotRunning(player !== EPlayer.black);

    if (player === EPlayer.black) {
      setFirstPos(start);
      setSecondPos(end);
      setPiecesCollectedByBlack(collection);
    } else {
      setPiecesCollectedByWhite(collection);
    }
  };

  const executeBot = (depth: number, squares: IPiece[]) => {
    if (mated) {
      return "bot cannot run";
    }

    const { moves, starts, ends } = getMoves(
      squares,
      passantPos,
      castlingConditions
    );

    const { randStart, randEnd, newRepetition } = findBestMove(
      moves,
      repetition,
      firstPos,
      secondPos,
      squares,
      passantPos,
      depth,
      starts,
      ends,
      castlingConditions
    );

    setRepetition(newRepetition);
    executeMove(EPlayer.black, squares, randStart, randEnd);
  };

  const handleClick = (idx: number) => {
    let copySquares = pieces.slice();

    if (mated) {
      return;
    }

    if (source === -1 && !isBotRunning) {
      if (copySquares[idx].player !== turn) {
        return;
      }

      if (copySquares[idx].player !== null) {
        copySquares = paintPossibleMoves(
          copySquares,
          idx,
          passantPos,
          castlingConditions
        );

        setSource(idx);
        setPieces(copySquares);
      }
    }

    if (source > -1) {
      const isCannibalism = copySquares[idx].player === turn;

      if (isCannibalism && source !== idx) {
        copySquares[source].highlight = false;

        copySquares = paintPossibleMoves(
          copySquares,
          idx,
          passantPos,
          castlingConditions
        );

        setSource(idx);
        setPieces(copySquares);
      } else {
        const availableSquare = isMoveAvailable(
          source,
          idx,
          copySquares,
          passantPos,
          castlingConditions
        );

        if (!availableSquare) {
          copySquares = paintCheck(
            copySquares,
            idx,
            source,
            passantPos,
            castlingConditions
          );

          setSource(-1);
          setPieces(copySquares);

          return;
        }

        executeMove(EPlayer.white, pieces, source, idx);

        const searchDepth = 3;
        setTimeout(() => {
          executeBot(searchDepth, pieces);
        }, 700);
      }
    }
  };

  return (
    <>
      <LeftScreen
        pieces={pieces}
        castlingConditions={castlingConditions}
        passantPos={passantPos}
        turn={turn}
        piecesCollectedByWhite={piecesCollectedByWhite}
        piecesCollectedByBlack={piecesCollectedByBlack}
        reset={reset}
      />

      <Board
        isBotRunning={isBotRunning}
        mated={mated}
        onClick={handleClick}
        statePieces={pieces}
      />
    </>
  );
};

export default Game;
