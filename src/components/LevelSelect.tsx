import { botLevel } from "../constants/info";
import { BOT_LEVELS } from "../engine/levels";

export default function LevelSelect({
  level,
  onChange,
}: {
  level: number;
  onChange: (level: number) => void;
}) {
  return (
    <label className="level_select">
      <span className="button_font">{botLevel}</span>
      <select value={level} onChange={(e) => onChange(Number(e.target.value))}>
        {BOT_LEVELS.map(({ name }, idx) => (
          <option key={name} value={idx}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
