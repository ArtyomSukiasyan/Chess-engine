import { EPieceAsciis } from "../../models/enums/PieceAsciis.enum";
import { EPlayer } from "../../models/enums/Player.enum";
import { IPiece } from "../../models/Piece";
import { getColByPosition, getRowByPosition } from "../getRowAndCallPosition";

export default function canEnpassant(
  start: number,
  end: number,
  pieces: IPiece[],
  statePassantPos: number,
  passantPos?: number
): boolean {
  let passant = passantPos ? passantPos : statePassantPos;
  let startRow = getRowByPosition(start);
  let startCol = getColByPosition(start);
  let endRow = getRowByPosition(end);
  let endCol = getColByPosition(end);
  let rowDiff = endRow - startRow;
  let colDiff = endCol - startCol;

  if (rowDiff === 2 || rowDiff === -2) {
    if (pieces[start].player === EPlayer.white && (start < 48 || start > 55)) {
      return false;
    }

    if (pieces[start].player === EPlayer.black && (start < 8 || start > 15)) {
      return false;
    }
  }

  if (pieces[end].ascii !== null) {
    if (colDiff === 0) {
      return false;
    }
  }

  if (rowDiff === 1 && colDiff === 1) {
    if (pieces[end].ascii === null) {
      if (pieces[start + 1].ascii !== EPieceAsciis.blackPawn || passant !== start + 1) {
        return false;
      }
    }
  } else if (rowDiff === 1 && colDiff === -1) {
    if (pieces[end].ascii === null) {
      if (pieces[start - 1].ascii !== EPieceAsciis.blackPawn || passant !== start - 1) {
        return false;
      }
    }
  } else if (rowDiff === -1 && colDiff === 1) {
    if (pieces[end].ascii === null) {
      if (pieces[start + 1].ascii !== EPieceAsciis.whitePawn || passant !== start + 1) {
        return false;
      }
    }
  } else if (rowDiff === -1 && colDiff === -1) {
    if (pieces[end].ascii === null) {
      if (pieces[start - 1].ascii !== EPieceAsciis.whitePawn || passant !== start - 1) {
        return false;
      }
    }
  }

  return true;
}
