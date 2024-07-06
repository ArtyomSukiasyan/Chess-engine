import { ReactElement } from "react";
import { EPieceAsciis } from "../models/enums/PieceAsciis.enum";
import { EPlayer } from "../models/enums/Player.enum";

import { Pieces } from '../constants/pieces';
import { PieceIcon } from '../components/PieceIcon';

export default class Queen {
  player: string;
  highlight: boolean;
  possible: boolean;
  icon: ReactElement<{}, string>;
  ascii: string;

  constructor(player: string) {
    this.player = player;
    this.highlight = false;
    this.possible = false;
    this.icon = <PieceIcon piece={Pieces.Queen} isWhite={player === EPlayer.white} />;
    this.ascii = player === EPlayer.white ? EPieceAsciis.whiteQueen : EPieceAsciis.blackQueen;
  }

  canMove(start: number, end: number) {
    const startRow = 8 - Math.floor(start / 8);
    const startCol = (start % 8) + 1;
    const endRow = 8 - Math.floor(end / 8);
    const endCol = (end % 8) + 1;

    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;

    const haveDiagonalMove = rowDiff === colDiff || rowDiff === -colDiff;
    const haveVerticalMove = rowDiff * colDiff === 0 && rowDiff + colDiff !== 0;

    return haveDiagonalMove || haveVerticalMove;
  }
}
