import { useEffect, useRef } from "react";
import { moveHistory, noMovesYet } from "../constants/info";

/** The game's moves, numbered in pairs (1. e4 e5 2. Nf3 ...), newest scrolled into view. */
export default function MoveHistory({ moves }: { moves: string[] }) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;

    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [moves.length]);

  const rows: [string, string | undefined][] = [];

  for (let i = 0; i < moves.length; i += 2) {
    rows.push([moves[i], moves[i + 1]]);
  }

  return (
    <div className="move_history">
      <p className="medium_font">{moveHistory}</p>
      {rows.length === 0 ? (
        <p className="small_font move_history_empty">{noMovesYet}</p>
      ) : (
        <ol className="move_list" ref={listRef}>
          {rows.map(([white, black], idx) => (
            <li key={idx}>
              <span className="move">{white}</span>
              <span className="move">{black}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
