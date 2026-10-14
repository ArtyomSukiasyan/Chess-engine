import { useEffect, useRef, useState, JSX } from "react";
import "./App.css";
import clearPiecesHighlight from "./helpers/UI/clearPiecesHighlight";
import getMoveConditions from "./helpers/gameLogic/getMoveConditions";
import initializeBoard from "./helpers/board/initializeBoard";
import isMoveAvailable from "./helpers/gameLogic/isMoveAvailable";
import { IPiece } from "./models/Piece";
import getMoves from "./helpers/gameLogic/getMoves";
import checkCastlingConditions from "./helpers/gameLogic/checkCastlingConditions";
import paintPossibleMoves from "./helpers/UI/paintPossibleMoves";
import paintCheck from "./helpers/UI/paintCheck";
import Board from "./components/Board";
import { defaultCastlingConditions } from "./constants/castlingConditions";
import LeftScreen from "./components/LeftScreen";
import { EPlayer } from "./models/enums/Player.enum";
import { EPieceAsciis } from "./models/enums/PieceAsciis.enum";
import getOpponent from "./helpers/getOpponent";
import { toBotPosition } from "./engine/fromApp";
import { BotPosition } from "./engine/position";
import { BotMove } from "./engine/bot";
import type { BotRequest, BotResponse } from "./engine/bot.worker";
import { BOT_LEVELS, DEFAULT_LEVEL } from "./engine/levels";
import { appMoveToSan } from "./engine/notation";
import { ICastlingConditions } from "./models/CastlingConditions";

/** The bot never answers faster than this, so its move is easy to follow. */
const MIN_BOT_DELAY_MS = 200;
const LEVEL_STORAGE_KEY = "chess-bot-level";

/** Everything needed to go back to a position of the game. */
interface GameSnapshot {
  pieces: IPiece[];
  turn: string;
  castlingConditions: ICastlingConditions;
  passantPos: number;
  piecesCollectedByWhite: JSX.Element[];
  piecesCollectedByBlack: JSX.Element[];
  mated: boolean;
  position: BotPosition;
  /** The move that led to this position (none for the starting position). */
  move?: { start: number; end: number; san: string };
}

const startSnapshot = (): GameSnapshot => ({
  pieces: initializeBoard(),
  turn: EPlayer.white,
  castlingConditions: defaultCastlingConditions,
  passantPos: -1,
  piecesCollectedByWhite: [],
  piecesCollectedByBlack: [],
  mated: false,
  position: toBotPosition(initializeBoard(), EPlayer.white, defaultCastlingConditions, -1),
});

/**
 * Fresh copies of a snapshot's pieces: the game mutates piece objects (highlights, check marks),
 * so the stored ones may carry flags from later positions.
 */
const restorePieces = (snapshot: GameSnapshot) =>
  snapshot.pieces.map((piece, idx) => {
    const copy: IPiece = Object.assign(Object.create(Object.getPrototypeOf(piece)), piece);
    copy.highlight = idx === snapshot.move?.start || idx === snapshot.move?.end;
    copy.possible = false;
    copy.inCheck = false;
    copy.checked = false;
    return copy;
  });

const loadLevel = () => {
  try {
    const stored = localStorage.getItem(LEVEL_STORAGE_KEY);
    const level = Number(stored);
    return stored !== null && BOT_LEVELS[level] ? level : DEFAULT_LEVEL;
  } catch {
    return DEFAULT_LEVEL;
  }
};

const Game: React.FC = () => {
  const [pieces, setPieces] = useState<IPiece[]>(initializeBoard());
  const [source, setSource] = useState<number>(-1);
  const [turn, setTurn] = useState<string>(EPlayer.white);
  const [castlingConditions, setCastlingConditions] = useState(
    defaultCastlingConditions
  );
  const [passantPos, setPassantPos] = useState<number>(-1);
  const [piecesCollectedByWhite, setPiecesCollectedByWhite] = useState<
    JSX.Element[]
  >([]);
  const [piecesCollectedByBlack, setPiecesCollectedByBlack] = useState<
    JSX.Element[]
  >([]);
  const [mated, setMated] = useState<boolean>(false);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [humanColor, setHumanColor] = useState<string>(EPlayer.white);
  /** Every position of the game so far (the last one is the current position). */
  const [history, setHistory] = useState<GameSnapshot[]>(() => [startSnapshot()]);
  const [level, setLevel] = useState<number>(loadLevel);

  const botColor = getOpponent(humanColor);
  const isBotRunning = turn === botColor && !mated;

  const restore = (snapshots: GameSnapshot[]) => {
    const snapshot = snapshots[snapshots.length - 1];

    setPieces(restorePieces(snapshot));
    setSource(-1);
    setTurn(snapshot.turn);
    setHistory(snapshots);
    setCastlingConditions(snapshot.castlingConditions);
    setPassantPos(snapshot.passantPos);
    setPiecesCollectedByWhite(snapshot.piecesCollectedByWhite);
    setPiecesCollectedByBlack(snapshot.piecesCollectedByBlack);
    setMated(snapshot.mated);
  };

  const reset = () => restore([startSnapshot()]);

  // Undo goes back to your previous turn: it takes back the bot's reply (if any) and your move.
  let undoTarget = history.length - 2;
  while (undoTarget >= 0 && history[undoTarget].turn !== humanColor) {
    undoTarget--;
  }

  const undo = () => {
    if (undoTarget >= 0) {
      restore(history.slice(0, undoTarget + 1));
    }
  };

  const changeLevel = (newLevel: number) => {
    setLevel(newLevel);

    try {
      localStorage.setItem(LEVEL_STORAGE_KEY, String(newLevel));
    } catch {
      // The level just won't be remembered.
    }
  };

  const switchColor = () => {
    const newColor = getOpponent(humanColor);

    setHumanColor(newColor);
    setFlipped(newColor === EPlayer.black);
    reset();
  };

  const executeMove = (
    player: string,
    squares: IPiece[],
    start: number,
    end: number
  ) => {
    let updatedSquares = clearPiecesHighlight(squares, player, humanColor);

    const kingASCII =
      player === EPlayer.white
        ? EPieceAsciis.whiteKing
        : EPieceAsciis.blackKing;

    const rookASCII =
      player === EPlayer.white
        ? EPieceAsciis.whiteRook
        : EPieceAsciis.blackRook;

    const isKing = squares[start].ascii === kingASCII;
    const isRook = squares[start].ascii === rookASCII;

    let nextCastlingConditions = castlingConditions;

    if (isKing || isRook) {
      nextCastlingConditions = checkCastlingConditions(
        updatedSquares,
        player,
        castlingConditions,
        start
      );

      setCastlingConditions(nextCastlingConditions);
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

    const nextTurn = getOpponent(player);
    const isMated = checkMated || staleMated;
    const san = appMoveToSan(history[history.length - 1].position, start, end);
    const collectedByWhite =
      player === EPlayer.white ? collection : piecesCollectedByWhite;
    const collectedByBlack =
      player === EPlayer.black ? collection : piecesCollectedByBlack;

    setPassantPos(passant);
    setPieces(updatedSquares);
    setSource(-1);
    setMated(isMated);
    setTurn(nextTurn);
    setPiecesCollectedByWhite(collectedByWhite);
    setPiecesCollectedByBlack(collectedByBlack);
    setHistory([
      ...history,
      {
        pieces: updatedSquares.slice(),
        turn: nextTurn,
        castlingConditions: nextCastlingConditions,
        passantPos: passant,
        piecesCollectedByWhite: collectedByWhite,
        piecesCollectedByBlack: collectedByBlack,
        mated: isMated,
        position: toBotPosition(updatedSquares, nextTurn, nextCastlingConditions, passant),
        move: { start, end, san },
      },
    ]);
  };

  const applyBotMove = (move: BotMove | null) => {
    if (!isBotRunning) {
      return;
    }

    let { start, end } = move ?? { start: -1, end: -1 };

    // Safety net: if the app's rules disagree with the bot, play any legal move instead.
    const isLegal =
      move !== null &&
      isMoveAvailable(start, end, pieces, passantPos, castlingConditions);

    if (!isLegal) {
      const moves = getMoves(pieces, passantPos, castlingConditions, botColor);

      if (moves.length === 0) {
        return;
      }

      [start, end] = moves;
    }

    executeMove(botColor, pieces, start, end);
  };

  // The search runs in a worker; answers for an outdated position are ignored.
  const workerRef = useRef<Worker | null>(null);
  const requestId = useRef(0);
  const requestTime = useRef(0);
  const applyBotMoveRef = useRef(applyBotMove);
  applyBotMoveRef.current = applyBotMove;

  useEffect(() => {
    const worker = new Worker(
      new URL("./engine/bot.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (event: MessageEvent<BotResponse>) => {
      const { id, move } = event.data;
      const wait = MIN_BOT_DELAY_MS - (Date.now() - requestTime.current);

      setTimeout(() => {
        if (id === requestId.current) {
          applyBotMoveRef.current(move);
        }
      }, Math.max(0, wait));
    };

    workerRef.current = worker;

    return () => worker.terminate();
  }, []);

  // The bot moves whenever it is its turn: after your move, or at the start when it plays white.
  useEffect(() => {
    const id = ++requestId.current;

    if (!isBotRunning) {
      return;
    }

    const request: BotRequest = {
      id,
      position: toBotPosition(pieces, botColor, castlingConditions, passantPos),
      history: history.slice(0, -1).map((snapshot) => snapshot.position),
      settings: BOT_LEVELS[level].settings,
    };

    requestTime.current = Date.now();
    workerRef.current?.postMessage(request);
  }, [isBotRunning, pieces, level]);

  const handleClick = (idx: number) => {
    let copySquares = pieces.slice();

    if (mated || isBotRunning) {
      return;
    }

    if (source === -1) {
      if (copySquares[idx].player !== turn) {
        return;
      }

      if (copySquares[idx].player !== null) {
        copySquares = paintPossibleMoves(
          copySquares,
          idx,
          passantPos,
          castlingConditions,
          humanColor
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
          castlingConditions,
          humanColor
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
            castlingConditions,
            humanColor
          );

          setSource(-1);
          setPieces(copySquares);

          return;
        }

        executeMove(humanColor, pieces, source, idx);
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
        flip={() => setFlipped(!flipped)}
        switchColor={switchColor}
        humanColor={humanColor}
        undo={undo}
        canUndo={undoTarget >= 0}
        moves={history.slice(1).map((snapshot) => snapshot.move?.san ?? "")}
        level={level}
        changeLevel={changeLevel}
      />

      <Board
        isBotRunning={isBotRunning}
        mated={mated}
        flipped={flipped}
        humanColor={humanColor}
        onClick={handleClick}
        statePieces={pieces}
      />
    </>
  );
};

export default Game;
