import {
  blackPlayer,
  description,
  matchInfo,
  title,
  whitePlayer,
} from "../constants/info";
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
  const isWhiteTurn = turn === EPlayer.white;

  return (
    <>
      <div className="content">
        <p className="header_font">{title}</p>
        <p className="medium_font">{description}</p>
      </div>
      <div className="content title">
        <p className="header_2_font">{matchInfo}</p>
      </div>

      <div className="wrapper">
        <PlayerBox
          player={whitePlayer}
          pieces={piecesCollectedByWhite}
          isBlack={false}
        />
        <PlayerBox
          player={blackPlayer}
          pieces={piecesCollectedByBlack}
          isBlack={true}
        />
      </div>
      <div className="wrapper">
        <HighlightBox isWhiteTurn={!isWhiteTurn} />
        <HighlightBox isWhiteTurn={isWhiteTurn} />
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

interface IPlayerBox {
  player: string;
  pieces: JSX.Element[];
  isBlack: boolean;
}

function PlayerBox({ player, pieces, isBlack }: IPlayerBox) {
  return (
    <div className={`player_box ${isBlack && "black_player_color"} `}>
      <p className="medium_font">{player}</p>
      {pieces}
    </div>
  );
}

function HighlightBox({ isWhiteTurn }: { isWhiteTurn: boolean }) {
  return (
    <div className={`highlight_box ${isWhiteTurn && "transparent"}`}></div>
  );
}
