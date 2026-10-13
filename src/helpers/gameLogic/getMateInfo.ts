import {
  botIsInCheck,
  botIsMated,
  botIsStaled,
  youAreInCheck,
  youAreMated,
  youAreStaled,
} from "../../constants/mateWrappers";
import { ICastlingConditions } from "../../models/CastlingConditions";
import { EPlayer } from "../../models/enums/Player.enum";
import { IPiece } from "../../models/Piece";
import checkmate from "./checkmate";
import inCheck from "./inCheck";
import stalemate from "./stalemate";

export default function getMateInfo(
  pieces: IPiece[],
  passantPos: number,
  castlingConditions: ICastlingConditions,
  turn: string,
  humanColor: string
) {
  const isWhiteTurn = turn === EPlayer.white;
  const isHumanWhite = humanColor === EPlayer.white;

  const {
    isBlackChecked,
    isBlackMated,
    isBlackStaled,
    isWhiteChecked,
    isWhiteMated,
    isWhiteStaled,
  } = getInfoConditions(pieces, passantPos, castlingConditions);

  return [
    {
      condition: isHumanWhite ? isWhiteChecked : isBlackChecked,
      text: youAreInCheck,
      additionalCondition: true,
    },
    {
      condition: isHumanWhite ? isBlackChecked : isWhiteChecked,
      text: botIsInCheck,
      additionalCondition: true,
    },
    {
      condition: isHumanWhite ? isWhiteMated : isBlackMated,
      text: youAreMated,
      additionalCondition: true,
    },
    {
      condition: isHumanWhite ? isBlackMated : isWhiteMated,
      text: botIsMated,
      additionalCondition: true,
    },
    {
      condition: isHumanWhite ? isWhiteStaled : isBlackStaled,
      text: youAreStaled,
      additionalCondition: isWhiteTurn === isHumanWhite,
    },
    {
      condition: isHumanWhite ? isBlackStaled : isWhiteStaled,
      text: botIsStaled,
      additionalCondition: isWhiteTurn !== isHumanWhite,
    },
  ];
}

function getInfoConditions(
  pieces: IPiece[],
  passantPos: number,
  castlingConditions: ICastlingConditions
) {
  const isWhiteChecked = inCheck(
    EPlayer.white,
    pieces,
    passantPos,
    castlingConditions
  );

  const isBlackChecked = inCheck(
    EPlayer.black,
    pieces,
    passantPos,
    castlingConditions
  );

  const isWhiteMated = checkmate(
    EPlayer.white,
    pieces,
    passantPos,
    castlingConditions
  );

  const isBlackMated = checkmate(
    EPlayer.black,
    pieces,
    passantPos,
    castlingConditions
  );

  const isWhiteStaled = stalemate(
    EPlayer.white,
    pieces,
    passantPos,
    castlingConditions
  );

  const isBlackStaled = stalemate(
    EPlayer.black,
    pieces,
    passantPos,
    castlingConditions
  );

  return {
    isBlackChecked,
    isBlackMated,
    isBlackStaled,
    isWhiteChecked,
    isWhiteMated,
    isWhiteStaled,
  };
}
