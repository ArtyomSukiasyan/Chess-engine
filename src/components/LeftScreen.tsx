import { ILeftScreen } from "../models/LeftScreen";
import MatchInfo from "./MatchInfo";
import FlipButton from "./FlipButton";
import ResetButton from "./ResetButton";
import SwitchColorButton from "./SwitchColorButton";
import UndoButton from "./UndoButton";
import LevelSelect from "./LevelSelect";
import MoveHistory from "./MoveHistory";

export default function LeftScreen({
  pieces,
  castlingConditions,
  passantPos,
  turn,
  piecesCollectedByWhite,
  piecesCollectedByBlack,
  reset,
  flip,
  switchColor,
  humanColor,
  undo,
  canUndo,
  moves,
  level,
  changeLevel,
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
          humanColor={humanColor}
        />

        <div className="button_wrapper">
          <ResetButton onClick={reset} />
          <FlipButton onClick={flip} />
          <SwitchColorButton onClick={switchColor} humanColor={humanColor} />
        </div>
        <div className="button_wrapper">
          <UndoButton onClick={undo} disabled={!canUndo} />
          <LevelSelect level={level} onChange={changeLevel} />
        </div>

        <MoveHistory moves={moves} />
      </div>
    </div>
  );
}
