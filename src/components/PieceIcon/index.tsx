import { IPieceIconProps } from './types';

import { Pieces } from '../../constants/pieces';

import W_BishopIcon from '../../assets/icons/pieces/w_bishop.png';
import W_KingIcon from '../../assets/icons/pieces/w_king.png';
import W_Knight from '../../assets/icons/pieces/w_knight.png';
import W_Pawn from '../../assets/icons/pieces/w_pawn.png';
import W_Queen from '../../assets/icons/pieces/w_queen.png';
import W_Rook from '../../assets/icons/pieces/w_rook.png';

import B_BishopIcon from '../../assets/icons/pieces/b_bishop.png';
import B_KingIcon from '../../assets/icons/pieces/b_king.png';
import B_Knight from '../../assets/icons/pieces/b_knight.png';
import B_Pawn from '../../assets/icons/pieces/b_pawn.png';
import B_Queen from '../../assets/icons/pieces/b_queen.png';
import B_Rook from '../../assets/icons/pieces/b_rook.png';

const icons = {
  white: {
    [Pieces.Bishop]: W_BishopIcon,
    [Pieces.King]: W_KingIcon,
    [Pieces.Knight]: W_Knight,
    [Pieces.Pawn]: W_Pawn,
    [Pieces.Queen]: W_Queen,
    [Pieces.Rook]: W_Rook,
  },
  black: {
    [Pieces.Bishop]: B_BishopIcon,
    [Pieces.King]: B_KingIcon,
    [Pieces.Knight]: B_Knight,
    [Pieces.Pawn]: B_Pawn,
    [Pieces.Queen]: B_Queen,
    [Pieces.Rook]: B_Rook,
  },
};

export const PieceIcon = ({ isWhite, piece }: IPieceIconProps) => (
  <span className='piece'>
    <img src={icons[isWhite ? 'white' : 'black'][piece]} alt={`piece-${piece.toLowerCase()}-icon`} />
  </span>
);
