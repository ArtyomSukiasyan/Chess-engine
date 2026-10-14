import { undo } from "../constants/info";

export default function UndoButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button className="reset_button" onClick={onClick} disabled={disabled}>
      <p className="button_font">{undo}</p>
    </button>
  );
}
