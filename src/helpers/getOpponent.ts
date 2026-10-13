import { EPlayer } from "../models/enums/Player.enum";

export default function getOpponent(player: string) {
  return player === EPlayer.white ? EPlayer.black : EPlayer.white;
}
