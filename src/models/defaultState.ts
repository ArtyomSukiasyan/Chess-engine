import { ICastlingConditions } from "./CastlingConditions";
import { IPiece } from "./Piece";

export type defaultState = {
  squares: IPiece[];
  source: number;
  turn: string;
  firstPos: number;
  secondPos: number;
  repetition: number;
  castlingConditions: ICastlingConditions;
  passantPos: number;
  isBotRunning: boolean;
  piecesCollectedByWhite: JSX.Element[];
  piecesCollectedByBlack: JSX.Element[];
  mated: boolean;
};
