import { ICastlingConditions } from "../../models/CastlingConditions";
import { EPieceAsciis } from "../../models/enums/PieceAsciis.enum";
import { EPlayer } from "../../models/enums/Player.enum";
import { IPiece } from "../../models/Piece";
import FillerPiece from "../../pieces/FillerPiece";
import Queen from "../../pieces/Queen";
import inCheck from "./inCheck";
import isInvalidMove from "./isInvalidMove";

export default function isMoveAvailable(
  start: number,
  end: number,
  pieces: IPiece[],
  statePassantPos: number,
  castlingConditions: ICastlingConditions,
  passant_pos?: number
) {
  if (start === end) {
    return false;
  }

  const player = pieces[start].player;
  if (player === pieces[end].player || !pieces[start].canMove(start, end)) {
    return false;
  }

  if (
    isInvalidMove(
      start,
      end,
      pieces,
      statePassantPos,
      castlingConditions,
      passant_pos
    )
  ) {
    return false;
  }

  const cantCastle =
    pieces[start].ascii === (player === EPlayer.white ? EPieceAsciis.whiteKing : EPieceAsciis.blackKing) &&
    Math.abs(end - start) === 2 &&
    inCheck(player as string, pieces, statePassantPos, castlingConditions);

  if (cantCastle) {
    return false;
  }

  if (
    pieces[start].ascii === (player === EPlayer.white ? EPieceAsciis.whiteKing : EPieceAsciis.blackKing) &&
    Math.abs(end - start) === 2
  ) {
    const deltaPos = end - start;
    const testSquares = pieces.slice();
    testSquares[start + (deltaPos === 2 ? 1 : -1)] = testSquares[start];
    testSquares[start] = new FillerPiece(null);
    if (
      inCheck(
        player as string,
        testSquares,
        statePassantPos,
        castlingConditions
      )
    )
      return false;
  }

  const checkSquares = pieces.slice();
  checkSquares[end] = checkSquares[start];
  checkSquares[start] = new FillerPiece(null);

  if (checkSquares[end].ascii === "p" && end >= 0 && end <= 7) {
    checkSquares[end] = new Queen(EPlayer.white);
  } else if (checkSquares[end].ascii === "P" && end >= 56 && end <= 63) {
    checkSquares[end] = new Queen(EPlayer.black);
  }
  if (
    inCheck(player as string, checkSquares, statePassantPos, castlingConditions)
  ) {
    return false;
  }

  return true;
}
