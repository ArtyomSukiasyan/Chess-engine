import { ILeftScreen } from "../models/LeftScreen";
import MatchInfo from "./MatchInfo";
import ResetButton from "./ResetButton";

export default function LeftScreen({
  pieces,
  castlingConditions,
  passantPos,
  turn,
  piecesCollectedByWhite,
  piecesCollectedByBlack,
  reset,
}: ILeftScreen) {
  return (
    <div className="left_screen ">
      <div className="side_box">
        <MatchInfo
          pieces={pieces}
          castlingConditions={castlingConditions}
          passantPos={passantPos}
          turn={turn}
          piecesCollectedByWhite={piecesCollectedByWhite}
          piecesCollectedByBlack={piecesCollectedByBlack}
        />

        <ResetButton onClick={reset} />
      </div>
    </div>
  );
}
