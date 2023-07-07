import { EPlayer } from "../models/enums/Player.enum";
import { IPiece } from "../models/Piece";

export default function canEnpassant(
  start: number,
  end: number,
  pieces: IPiece[],
  statePassantPos: number,
  passantPos?: number
): boolean {
  let passant = passantPos === undefined ? statePassantPos : passantPos;
  let startRow = 8 - Math.floor(start / 8);
  let startCol = (start % 8) + 1;
  let endRow = 8 - Math.floor(end / 8);
  let endCol = (end % 8) + 1;
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
      if (pieces[start + 1].ascii !== "P" || passant !== start + 1) {
        return false;
      }
    }
  } else if (rowDiff === 1 && colDiff === -1) {
    if (pieces[end].ascii === null) {
      if (pieces[start - 1].ascii !== "P" || passant !== start - 1) {
        return false;
      }
    }
  } else if (rowDiff === -1 && colDiff === 1) {
    if (pieces[end].ascii === null) {
      if (pieces[start + 1].ascii !== "p" || passant !== start + 1) {
        return false;
      }
    }
  } else if (rowDiff === -1 && colDiff === -1) {
    if (pieces[end].ascii === null) {
      if (pieces[start - 1].ascii !== "p" || passant !== start - 1) {
        return false;
      }
    }
  }

  return true;
}
