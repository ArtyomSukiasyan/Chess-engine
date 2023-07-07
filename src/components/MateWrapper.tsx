import checkmate from "../helpers/checkmate";
import inCheck from "../helpers/inCheck";
import stalemate from "../helpers/stalemate";
import { EPlayer } from "../models/enums/Player.enum";
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
        {inCheck(EPlayer.white, pieces, passantPos, castlingConditions) &&
        checkmate(EPlayer.white, pieces, passantPos, castlingConditions)
          ? "You are in check!"
          : ""}
      </p>
      <p className="small_font">
        {inCheck(EPlayer.black, pieces, passantPos, castlingConditions) &&
        !checkmate(EPlayer.black, pieces, passantPos, castlingConditions)
          ? "Black player is in check."
          : ""}
      </p>
      <p className="small_font">
        {checkmate(EPlayer.white, pieces, passantPos, castlingConditions)
          ? "You lost by checkmate."
          : ""}
      </p>
      <p className="small_font">
        {checkmate(EPlayer.black, pieces, passantPos, castlingConditions)
          ? "You won by checkmate!"
          : ""}
      </p>
      <p className="small_font">
        {stalemate(EPlayer.white, pieces, passantPos, castlingConditions) && turn === EPlayer.white
          ? "You are in stalemate. Game over."
          : ""}
      </p>
      <p className="small_font">
        {stalemate(EPlayer.black, pieces, passantPos, castlingConditions) && turn === EPlayer.black
          ? "Black is in stalemate. Game over."
          : ""}
      </p>
    </div>
  );
}
