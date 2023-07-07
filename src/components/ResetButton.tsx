import { MouseEventHandler } from "react";

export default function ResetButton({
  onClick,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <div className="button_wrapper">
      <button className="reset_button" onClick={onClick}>
        <p className="button_font">Restart Game</p>
      </button>
    </div>
  );
}
