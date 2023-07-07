import { ICastlingConditions } from "./CastlingConditions";
import { IPiece } from "./Piece";

export interface IMateWrapper {
  pieces: IPiece[];
  passantPos: number;
  castlingConditions: ICastlingConditions;
  turn: string;
}
