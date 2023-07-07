import Collected from "../components/Collection";
import { ICastlingConditions } from "../models/CastlingConditions";
import { EPlayer } from "../models/enums/Player.enum";
import { IPiece } from "../models/Piece";
import FillerPiece from "../pieces/FillerPiece";
import checkmate from "./checkmate";
import highlightMate from "./UI/highlightMate";
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
    player === EPlayer.white
      ? piecesCollectedByWhite.slice()
      : piecesCollectedByBlack.slice();

  if (pieces[end].ascii !== null) {
    collection.push(<Collected value={pieces[end]} />);
  }

  if (pieces[start].ascii === (player === EPlayer.white ? "p" : "P")) {
    if (end - start === (player === EPlayer.white ? -9 : 7)) {
      if (start - 1 === passantPos) {
        collection.push(<Collected value={pieces[start - 1]} />);
        pieces[start - 1] = new FillerPiece(null);
      }
    } else if (end - start === (player === EPlayer.white ? -7 : 9)) {
      if (start + 1 === passantPos) {
        collection.push(<Collected value={pieces[start + 1]} />);
        pieces[start + 1] = new FillerPiece(null);
      }
    }
  }

  pieces = makeMove(pieces, start, end, passantPos);

  const passantTrue =
    player === EPlayer.white
      ? pieces[end].ascii === "p" &&
        start >= 48 &&
        start <= 55 &&
        end - start === -16
      : pieces[end].ascii === "P" &&
        start >= 8 &&
        start <= 15 &&
        end - start === 16;
  const passant = passantTrue ? end : -1;

  const isWhiteMated = checkmate(EPlayer.white, pieces, passantPos, castlingConditions);
  const isBlackMated = checkmate(EPlayer.black, pieces, passantPos, castlingConditions);

  const isWhiteStaled = stalemate(EPlayer.white, pieces, passantPos, castlingConditions);
  const isBlackStaled = stalemate(EPlayer.black, pieces, passantPos, castlingConditions);

  if (player === EPlayer.white) {
    pieces = highlightMate(EPlayer.black, pieces, isBlackMated, isBlackStaled);
  } else {
    pieces = highlightMate(EPlayer.white, pieces, isWhiteMated, isWhiteStaled);
  }

  const checkMated = isWhiteMated || isBlackMated;

  const staleMated =
    (isWhiteStaled && player === EPlayer.black) || (isBlackStaled && player === EPlayer.white);

  return { checkMated, staleMated, passant, collection };
}
