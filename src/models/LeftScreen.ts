import { MouseEventHandler, JSX } from "react";
import { ICastlingConditions } from "./CastlingConditions";
import { IPiece } from "./Piece";

export interface ILeftScreen {
  pieces: IPiece[];
  castlingConditions: ICastlingConditions;
  passantPos: number;
  turn: string;
  piecesCollectedByWhite: JSX.Element[];
  piecesCollectedByBlack: JSX.Element[];
  reset: MouseEventHandler<HTMLButtonElement>;
  flip: MouseEventHandler<HTMLButtonElement>;
  switchColor: MouseEventHandler<HTMLButtonElement>;
  humanColor: string;
  undo: () => void;
  canUndo: boolean;
  /** The game's moves in standard algebraic notation. */
  moves: string[];
  level: number;
  changeLevel: (level: number) => void;
}
