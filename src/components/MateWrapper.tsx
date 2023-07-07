import checkmate from "../helpers/checkmate";
import inCheck from "../helpers/inCheck";
import stalemate from "../helpers/stalemate";
import { IMateWrapper } from "../models/MateWrapper";

export default function MateWrapper({
  pieces,
  passantPos,
  castlingConditions,
  turn,
}: IMateWrapper) {
  return (
    <div className="mate_wrapper">
      <p className="small_font">
        {inCheck("w", pieces, passantPos, castlingConditions) &&
        checkmate("w", pieces, passantPos, castlingConditions)
          ? "You are in check!"
          : ""}
      </p>
      <p className="small_font">
        {inCheck("b", pieces, passantPos, castlingConditions) &&
        !checkmate("b", pieces, passantPos, castlingConditions)
          ? "Black player is in check."
          : ""}
      </p>
      <p className="small_font">
        {checkmate("w", pieces, passantPos, castlingConditions)
          ? "You lost by checkmate."
          : ""}
      </p>
      <p className="small_font">
        {checkmate("b", pieces, passantPos, castlingConditions)
          ? "You won by checkmate!"
          : ""}
      </p>
      <p className="small_font">
        {stalemate("w", pieces, passantPos, castlingConditions) && turn === "w"
          ? "You are in stalemate. Game over."
          : ""}
      </p>
      <p className="small_font">
        {stalemate("b", pieces, passantPos, castlingConditions) && turn === "b"
          ? "Black is in stalemate. Game over."
          : ""}
      </p>
    </div>
  );
}
