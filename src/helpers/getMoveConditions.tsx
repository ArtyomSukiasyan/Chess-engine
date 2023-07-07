import Collected from "../components/Collection";
import { ICastlingConditions } from "../models/CastlingConditions";
import { IPiece } from "../models/Piece";
import FillerPiece from "../pieces/FillerPiece";
import checkmate from "./checkmate";
import highlightMate from "./highlightMate";
import makeMove from "./makeMove";
import stalemate from "./stalemate";

export default function getMoveConditions(
  player: string,
  piecesCollectedByWhite: JSX.Element[],
  piecesCollectedByBlack: JSX.Element[],
  pieces: IPiece[],
  start: number,
  end: number,
  passantPos: number,
  castlingConditions: ICastlingConditions
) {
  const collection =
    player === "w"
      ? piecesCollectedByWhite.slice()
      : piecesCollectedByBlack.slice();

  if (pieces[end].ascii !== null) {
    collection.push(<Collected value={pieces[end]} />);
  }

  if (pieces[start].ascii === (player === "w" ? "p" : "P")) {
    if (end - start === (player === "w" ? -9 : 7)) {
      if (start - 1 === passantPos) {
        collection.push(<Collected value={pieces[start - 1]} />);
        pieces[start - 1] = new FillerPiece(null);
      }
    } else if (end - start === (player === "w" ? -7 : 9)) {
      if (start + 1 === passantPos) {
        collection.push(<Collected value={pieces[start + 1]} />);
        pieces[start + 1] = new FillerPiece(null);
      }
    }
  }

  pieces = makeMove(pieces, start, end, passantPos);

  const passantTrue =
    player === "w"
      ? pieces[end].ascii === "p" &&
        start >= 48 &&
        start <= 55 &&
        end - start === -16
      : pieces[end].ascii === "P" &&
        start >= 8 &&
        start <= 15 &&
        end - start === 16;
  const passant = passantTrue ? end : 65;

  const isWhiteMated = checkmate("w", pieces, passantPos, castlingConditions);
  const isBlackMated = checkmate("b", pieces, passantPos, castlingConditions);

  const isWhiteStaled = stalemate("w", pieces, passantPos, castlingConditions);
  const isBlackStaled = stalemate("b", pieces, passantPos, castlingConditions);

  if (player === "w") {
    pieces = highlightMate("b", pieces, isBlackMated, isBlackStaled);
  } else {
    pieces = highlightMate("w", pieces, isWhiteMated, isWhiteStaled);
  }

  const checkMated = isWhiteMated || isBlackMated;

  const staleMated =
    (isWhiteStaled && player === "b") || (isBlackStaled && player === "w");

  return { checkMated, staleMated, passant, collection };
}
