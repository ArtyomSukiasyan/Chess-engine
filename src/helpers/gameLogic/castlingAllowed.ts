import { ICastlingConditions } from "../../models/CastlingConditions";
import { EPlayer } from "../../models/enums/Player.enum";
import { IPiece } from "../../models/Piece";

export default function castlingAllowed(
  startPosition: number,
  endPosition: number,
  pieces: IPiece[],
  castlingConditions: ICastlingConditions
): boolean {
  const player = pieces[startPosition].player;
  const kingDefaultPosition = player === EPlayer.white ? 60 : 4;

  if (startPosition !== kingDefaultPosition) {
    return false;
  }

  const deltaPos = endPosition - startPosition;
  const rookASCII = player === EPlayer.white ? "r" : "R";

  const kingASCII =
    deltaPos === 2
      ? pieces[endPosition + 1].ascii
      : pieces[endPosition - 2].ascii;

  if (kingASCII !== rookASCII) {
    return false;
  }

  const isKingHasMoved =
    player === EPlayer.white
      ? castlingConditions.whiteKingHasMoved
      : castlingConditions.blackKingHasMoved;

  if (isKingHasMoved) {
    return false;
  }

  const isWhiteRookHasMoved =
    deltaPos === 2
      ? castlingConditions.rightWhiteRookHasMoved
      : castlingConditions.leftWhiteRookHasMoved;

  if (player === EPlayer.white && isWhiteRookHasMoved) {
    return false;
  }

  const isBlackRookHasMoved =
    deltaPos === 2
      ? castlingConditions.rightBlackRookHasMoved
      : castlingConditions.leftBlackRookHasMoved;

  if (isBlackRookHasMoved) {
    return false;
  }

  return true;
}
