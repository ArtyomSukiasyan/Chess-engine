import { ICastlingConditions } from "./CastlingConditions";
import { IPiece } from "./Piece";

export type defaultState = {
  squares: IPiece[];
  source: number;
  turn: string;
  trueTurn: string;
  turnNum: number;
  firstPos: number | null;
  secondPos: number | null;
  repetition: number;
  castlingConditions: ICastlingConditions;
  passantPos: number;
  isBotRunning: boolean;
  piecesCollectedByWhite: JSX.Element[];
  piecesCollectedByBlack: JSX.Element[];
  mated: boolean;
};
