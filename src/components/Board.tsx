import { colNumbers, rowNumbers } from "../constants/colNumbersAndRowNumbers";
import getSquareClasses from "../helpers/UI/getSquareClasses";
import { IBoard } from "../models/Board";
import Square from "./Square";

const FILES = "abcdefgh";

export default function Board({
  onClick,
  statePieces,
  isBotRunning,
  mated,
  flipped,
  humanColor,
}: IBoard) {
  const board = [];

  // When flipped, rows and columns are drawn in reverse so black is at the bottom.
  for (let row = 0; row < 8; row++) {
    const i = flipped ? 7 - row : row;
    const squareRows = [];

    for (let col = 0; col < 8; col++) {
      const j = flipped ? 7 - col : col;
      const { squareColor, squareCursor, pieces } = getSquareClasses(
        i,
        j,
        statePieces,
        isBotRunning,
        mated,
        humanColor
      );

      squareRows.push(
        <Square
          key={i * 8 + j}
          value={pieces[i * 8 + j]}
          color={squareColor}
          cursor={squareCursor}
          onClick={() => onClick(i * 8 + j)}
          rankLabel={col === 0 ? 8 - i : undefined}
          fileLabel={row === 7 ? FILES[j] : undefined}
        />
      );
    }

    board.push(<div key={i}>{squareRows}</div>);
  }

  return (
    <div className="right_screen">
      <div className="row_label">
        {flipped ? [...rowNumbers].reverse() : rowNumbers}
      </div>
      <div className="table"> {board} </div>
      <div className="col_label">
        {flipped ? [...colNumbers].reverse() : colNumbers}
      </div>
    </div>
  );
}
