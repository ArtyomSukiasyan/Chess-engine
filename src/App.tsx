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

/** How long the bot may think per move. */
const BOT_TIME_MS = 1500;
/** The bot never answers faster than this, so its move is easy to follow. */
const MIN_BOT_DELAY_MS = 200;

const startHistory = () => [
  toBotPosition(initializeBoard(), EPlayer.white, defaultCastlingConditions, -1),
];

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
  const [positionHistory, setPositionHistory] =
    useState<BotPosition[]>(startHistory);

  const botColor = getOpponent(humanColor);
  const isBotRunning = turn === botColor && !mated;

  const reset = () => {
    setPieces(initializeBoard());
    setSource(-1);
    setTurn(EPlayer.white);
    setPositionHistory(startHistory());
    setCastlingConditions(defaultCastlingConditions);
    setPassantPos(-1);
    setPiecesCollectedByWhite([]);
    setPiecesCollectedByBlack([]);
    setMated(false);
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

    setPassantPos(passant);
    setPieces(updatedSquares);
    setSource(-1);
    setMated(checkMated || staleMated);
    setTurn(getOpponent(player));
    setPositionHistory([
      ...positionHistory,
      toBotPosition(
        updatedSquares,
        getOpponent(player),
        nextCastlingConditions,
        passant
      ),
    ]);

    if (player === EPlayer.black) {
      setPiecesCollectedByBlack(collection);
    } else {
      setPiecesCollectedByWhite(collection);
    }
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
      history: positionHistory.slice(0, -1),
      timeLimitMs: BOT_TIME_MS,
    };

    requestTime.current = Date.now();
    workerRef.current?.postMessage(request);
  }, [isBotRunning, pieces]);

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
