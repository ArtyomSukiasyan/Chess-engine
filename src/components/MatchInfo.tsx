import { EPlayer } from "../models/enums/Player.enum";
import { IMatchInfo } from "../models/MatchInfo";
import MateWrapper from "./MateWrapper";

export default function MatchInfo({
  pieces,
  passantPos,
  castlingConditions,
  turn,
  piecesCollectedByWhite,
  piecesCollectedByBlack,
}: IMatchInfo) {
  return (
    <>
      <div className="content">
        <p className="header_font">ReactJS Chess</p>
        <p className="medium_font">Play against our friendly bot!</p>
      </div>
      <div className="content title">
        <p className="header_2_font">Match Information</p>
      </div>

      <div className="wrapper">
        <div className="player_box">
          <p className="medium_font">White (You)</p>
          {piecesCollectedByWhite}
        </div>
        <div className="player_box black_player_color">
          <p className="medium_font">Black (Bot)</p>
          {piecesCollectedByBlack}
        </div>
      </div>
      <div className="wrapper">
        {turn === EPlayer.white ? (
          <div className="highlight_box"></div>
        ) : (
          <div className="highlight_box transparent"></div>
        )}
        {turn === EPlayer.black ? (
          <div className="highlight_box"></div>
        ) : (
          <div className="highlight_box transparent"></div>
        )}
      </div>

      <MateWrapper
        pieces={pieces}
        castlingConditions={castlingConditions}
        passantPos={passantPos}
        turn={turn}
      />
    </>
  );
}
