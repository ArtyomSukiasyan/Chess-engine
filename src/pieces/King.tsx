import { ReactElement } from "react";
import { EPieceAsciis } from "../models/enums/PieceAsciis.enum";
import { EPlayer } from "../models/enums/Player.enum";

export default class King {
  player: string;
  highlight: boolean;
  possible: boolean;
  icon: ReactElement<{}, string>;
  ascii: string;
  checked: boolean;
  inCheck: boolean;

  constructor(player: string) {
    this.player = player;
    this.highlight = false;
    this.possible = false;
    this.checked = false;
    this.inCheck = false;
    this.icon = (
      <span className="piece">
        {player === EPlayer.white ? String.fromCharCode(9812) : String.fromCharCode(9818)}
      </span>
    );
    this.ascii = player === EPlayer.white ? EPieceAsciis.whiteKing : EPieceAsciis.blackKing;
  }

  canMove(start: number, end: number) {
    const startRow = 8 - Math.floor(start / 8);
    const startCol = (start % 8) + 1;
    const endRow = 8 - Math.floor(end / 8);
    const endCol = (end % 8) + 1;

    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;

    const topLeft = rowDiff === 1 && colDiff === -1;
    const top = rowDiff === 1 && colDiff === 0;
    const topRight = rowDiff === 1 && colDiff === 1;
    const downLeft = rowDiff === -1 && colDiff === -1;
    const down = rowDiff === -1 && colDiff === 0;
    const downRight = rowDiff === -1 && colDiff === 1;
    const doubleLeft = rowDiff === 0 && colDiff === -2;
    const left = rowDiff === 0 && colDiff === -1;
    const fixed = rowDiff === 0 && colDiff === 0;
    const right = rowDiff === 0 && colDiff === 1;
    const doubleRight = rowDiff === 0 && colDiff === 2;

    return (
      topLeft ||
      top ||
      topRight ||
      downLeft ||
      down ||
      downRight ||
      left ||
      doubleLeft ||
      fixed ||
      right ||
      doubleRight
    );
  }
}
