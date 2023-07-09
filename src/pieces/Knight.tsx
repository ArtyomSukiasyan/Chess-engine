import { ReactElement } from "react";
import { EPieceAsciis } from "../models/enums/PieceAsciis.enum";
import { EPlayer } from "../models/enums/Player.enum";

export default class Knight {
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
        {player === EPlayer.white ? String.fromCharCode(9816) : String.fromCharCode(9822)}
      </span>
    );
    this.ascii = player === EPlayer.white ? EPieceAsciis.whiteKnight : EPieceAsciis.blackKnight;
  }

  canMove(start: number, end: number) {
    const startRow = 8 - Math.floor(start / 8);
    const startCol = (start % 8) + 1;
    const endRow = 8 - Math.floor(end / 8);
    const endCol = (end % 8) + 1;

    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;

    const leftTop = rowDiff === 1 && colDiff === -2;
    const topLeft = rowDiff === 2 && colDiff === -1;
    const topRight = rowDiff === 2 && colDiff === 1;
    const rightTop = rowDiff === 1 && colDiff === 2;
    const rightDown = rowDiff === -1 && colDiff === 2;
    const downRight = rowDiff === -2 && colDiff === 1;
    const downLeft = rowDiff === -2 && colDiff === -1;
    const leftDown = rowDiff === -1 && colDiff === -2;

    return (
      leftTop ||
      topLeft ||
      topRight ||
      rightTop ||
      rightDown ||
      downRight ||
      downLeft ||
      leftDown
    );
  }
}
