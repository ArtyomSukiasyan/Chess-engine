import { ReactElement } from "react";
import { EPieceAsciis } from "../models/enums/PieceAsciis.enum";
import { EPlayer } from "../models/enums/Player.enum";

export default class Pawn {
  player: string;
  highlight: boolean;
  possible: boolean;
  icon: ReactElement<{}, string>;
  ascii: string;

  constructor(player: string) {
    this.player = player;
    this.highlight = false;
    this.possible = false;
    this.icon = (
      <span className="piece">
        {player === EPlayer.white ? String.fromCharCode(9817) : String.fromCharCode(9823)}
      </span>
    );
    this.ascii = player === EPlayer.white ? EPieceAsciis.whitePawn : EPieceAsciis.blackPawn;
  }

  canMove(start: number, end: number) {
    const startRow = 8 - Math.floor(start / 8);
    const startCol = (start % 8) + 1;
    const endRow = 8 - Math.floor(end / 8);
    const endCol = (end % 8) + 1;

    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;

    if (this.player === EPlayer.white) {
      if (colDiff === 0) {
        return rowDiff === 1 || rowDiff === 2;
      } else if (colDiff === -1 || colDiff === 1) {
        return rowDiff === 1;
      }
    } else {
      if (colDiff === 0) {
        return rowDiff === -2 || rowDiff === -1;
      } else if (colDiff === -1 || colDiff === 1) {
        return rowDiff === -1;
      }
    }

    return false;
  }
}
