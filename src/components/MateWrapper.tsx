import getMateInfo from "../helpers/gameLogic/getMateInfo";
import { IMateWrapper } from "../models/MateWrapper";

export default function MateWrapper({
  pieces,
  passantPos,
  castlingConditions,
  turn,
}: IMateWrapper) {
  const mateInfo = getMateInfo(pieces, passantPos, castlingConditions, turn);

  return (
    <div className="mate_wrapper">
      {mateInfo.map((el) => (
        <p className="small_font" key={el.text}>
          {el.condition && el.additionalCondition && el.text}
        </p>
      ))}
    </div>
  );
}
