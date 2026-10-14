/**
 * Fast board for the bot: a 0x88 board with make/unmake, so the search does not allocate.
 * Square 0 is a8 and 0x77 is h1, the same orientation as the app (row 0 = rank 8).
 */

export const WHITE = 0;
export const BLACK = 8;

export const PAWN = 1;
export const KNIGHT = 2;
export const BISHOP = 3;
export const ROOK = 4;
export const QUEEN = 5;
export const KING = 6;

export const FLAG_EN_PASSANT = 1;
export const FLAG_CASTLE = 2;
export const FLAG_PROMOTION = 4;
export const FLAG_DOUBLE_STEP = 8;

/** Castling right bits. */
export const WHITE_KING_SIDE = 1;
export const WHITE_QUEEN_SIDE = 2;
export const BLACK_KING_SIDE = 4;
export const BLACK_QUEEN_SIDE = 8;

/** Plain, serializable position that the app hands to the bot. */
export interface BotPosition {
  /** 64 squares (0 = a8), each `color | type` or 0 for empty. */
  board: number[];
  side: number;
  castling: number;
  /** Square (0..63) a pawn can capture en passant onto, or -1. */
  enPassant: number;
}

export const moveFrom = (move: number) => move & 127;
export const moveTo = (move: number) => (move >> 7) & 127;
export const moveFlags = (move: number) => move >> 14;
const makeMoveCode = (from: number, to: number, flags: number) => from | (to << 7) | (flags << 14);

export const to64 = (sq: number) => (sq >> 4) * 8 + (sq & 7);
export const to0x88 = (sq: number) => ((sq >> 3) << 4) | (sq & 7);

const KNIGHT_OFFSETS = [-33, -31, -18, -14, 14, 18, 31, 33];
const KING_OFFSETS = [-17, -16, -15, -1, 1, 15, 16, 17];
const BISHOP_DIRECTIONS = [-17, -15, 15, 17];
const ROOK_DIRECTIONS = [-16, -1, 1, 16];
const QUEEN_DIRECTIONS = KING_OFFSETS;

const E1 = 0x74;
const E8 = 0x04;

/** Castling rights kept when a piece moves from or to a square. */
const CASTLING_KEEP = new Uint8Array(128).fill(15);
CASTLING_KEEP[0x70] = 15 & ~WHITE_QUEEN_SIDE;
CASTLING_KEEP[0x77] = 15 & ~WHITE_KING_SIDE;
CASTLING_KEEP[E1] = 15 & ~(WHITE_KING_SIDE | WHITE_QUEEN_SIDE);
CASTLING_KEEP[0x00] = 15 & ~BLACK_QUEEN_SIDE;
CASTLING_KEEP[0x07] = 15 & ~BLACK_KING_SIDE;
CASTLING_KEEP[E8] = 15 & ~(BLACK_KING_SIDE | BLACK_QUEEN_SIDE);

// Zobrist keys as two 32-bit halves, from a fixed seed so hashes are reproducible.
let seed = 0x9e3779b9;
const random32 = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed | 0;
};
const randomTable = (size: number) => Int32Array.from({ length: size }, random32);

const PIECE_KEYS_LO = randomTable(16 * 128);
const PIECE_KEYS_HI = randomTable(16 * 128);
const CASTLING_KEYS_LO = randomTable(16);
const CASTLING_KEYS_HI = randomTable(16);
const EN_PASSANT_KEYS_LO = randomTable(128);
const EN_PASSANT_KEYS_HI = randomTable(128);
const SIDE_KEY_LO = random32();
const SIDE_KEY_HI = random32();

const MAX_HISTORY = 2048;

export class Position {
  board = new Int8Array(128);
  side = WHITE;
  castling = 0;
  /** 0x88 en passant target square or -1. */
  enPassant = -1;
  kings = [0, 0];
  hashLo = 0;
  hashHi = 0;

  // Undo stack; entry i also holds the hash of the position before move i.
  private undoMove = new Int32Array(MAX_HISTORY);
  private undoCaptured = new Int8Array(MAX_HISTORY);
  private undoCastling = new Int8Array(MAX_HISTORY);
  private undoEnPassant = new Int16Array(MAX_HISTORY);
  private undoHalfmove = new Int16Array(MAX_HISTORY);
  private historyLo = new Int32Array(MAX_HISTORY);
  private historyHi = new Int32Array(MAX_HISTORY);
  private count = 0;
  /** Moves since the last capture or pawn move (bounds the repetition scan). */
  halfmove = 0;

  constructor(position: BotPosition, history: BotPosition[] = []) {
    for (const previous of history) {
      this.load(previous);
      this.historyLo[this.count] = this.hashLo;
      this.historyHi[this.count] = this.hashHi;
      this.count++;
    }
    this.load(position);
    this.halfmove = this.count;
  }

  private load(position: BotPosition) {
    this.board.fill(0);
    position.board.forEach((piece, i) => {
      const sq = to0x88(i);
      this.board[sq] = piece;
      if ((piece & 7) === KING) this.kings[piece >> 3] = sq;
    });
    this.side = position.side;
    this.castling = position.castling;
    this.enPassant = position.enPassant === -1 ? -1 : to0x88(position.enPassant);
    this.computeHash();
  }

  private computeHash() {
    let lo = 0;
    let hi = 0;
    for (let sq = 0; sq < 128; sq++) {
      const piece = this.board[sq];
      if (sq & 0x88 || !piece) continue;
      lo ^= PIECE_KEYS_LO[piece * 128 + sq];
      hi ^= PIECE_KEYS_HI[piece * 128 + sq];
    }
    lo ^= CASTLING_KEYS_LO[this.castling];
    hi ^= CASTLING_KEYS_HI[this.castling];
    if (this.enPassant !== -1) {
      lo ^= EN_PASSANT_KEYS_LO[this.enPassant];
      hi ^= EN_PASSANT_KEYS_HI[this.enPassant];
    }
    if (this.side === BLACK) {
      lo ^= SIDE_KEY_LO;
      hi ^= SIDE_KEY_HI;
    }
    this.hashLo = lo;
    this.hashHi = hi;
  }

  isAttacked(sq: number, by: number): boolean {
    const board = this.board;

    // A white pawn attacks up the board (towards lower indexes), so it sits below the square.
    const pawn = by | PAWN;
    const pawnRow = by === WHITE ? 16 : -16;
    const left = sq + pawnRow - 1;
    const right = sq + pawnRow + 1;
    if (!(left & 0x88) && board[left] === pawn) return true;
    if (!(right & 0x88) && board[right] === pawn) return true;

    for (const offset of KNIGHT_OFFSETS) {
      const target = sq + offset;
      if (!(target & 0x88) && board[target] === (by | KNIGHT)) return true;
    }
    for (const offset of KING_OFFSETS) {
      const target = sq + offset;
      if (!(target & 0x88) && board[target] === (by | KING)) return true;
    }

    for (const direction of BISHOP_DIRECTIONS) {
      for (let target = sq + direction; !(target & 0x88); target += direction) {
        const piece = board[target];
        if (!piece) continue;
        if (piece === (by | BISHOP) || piece === (by | QUEEN)) return true;
        break;
      }
    }
    for (const direction of ROOK_DIRECTIONS) {
      for (let target = sq + direction; !(target & 0x88); target += direction) {
        const piece = board[target];
        if (!piece) continue;
        if (piece === (by | ROOK) || piece === (by | QUEEN)) return true;
        break;
      }
    }
    return false;
  }

  inCheck(): boolean {
    return this.isAttacked(this.kings[this.side >> 3], this.side ^ BLACK);
  }

  /**
   * Writes pseudo-legal moves into `moves` and returns how many there are.
   * With `tacticalOnly` only captures and promotions are generated (for the quiescence search).
   */
  generate(moves: Int32Array, tacticalOnly: boolean): number {
    const { board, side } = this;
    const enemy = side ^ BLACK;
    let n = 0;

    for (let from = 0; from < 128; from++) {
      if (from & 0x88) {
        from += 7;
        continue;
      }
      const piece = board[from];
      if (!piece || (piece & BLACK) !== side) continue;
      const type = piece & 7;

      if (type === PAWN) {
        const forward = side === WHITE ? -16 : 16;
        const row = from >> 4;
        const promotes = row === (side === WHITE ? 1 : 6);
        const promotionFlag = promotes ? FLAG_PROMOTION : 0;

        const one = from + forward;
        if (!board[one] && (!tacticalOnly || promotes)) {
          moves[n++] = makeMoveCode(from, one, promotionFlag);
          const two = one + forward;
          if (!tacticalOnly && row === (side === WHITE ? 6 : 1) && !board[two]) {
            moves[n++] = makeMoveCode(from, two, FLAG_DOUBLE_STEP);
          }
        }
        for (const target of [one - 1, one + 1]) {
          if (target & 0x88) continue;
          const victim = board[target];
          if (victim && (victim & BLACK) === enemy) {
            moves[n++] = makeMoveCode(from, target, promotionFlag);
          } else if (target === this.enPassant) {
            moves[n++] = makeMoveCode(from, target, FLAG_EN_PASSANT);
          }
        }
        continue;
      }

      if (type === KNIGHT || type === KING) {
        for (const offset of type === KNIGHT ? KNIGHT_OFFSETS : KING_OFFSETS) {
          const target = from + offset;
          if (target & 0x88) continue;
          const victim = board[target];
          if (victim ? (victim & BLACK) === enemy : !tacticalOnly) {
            moves[n++] = makeMoveCode(from, target, 0);
          }
        }
        if (type === KING && !tacticalOnly) n = this.generateCastling(moves, n, from);
        continue;
      }

      const directions =
        type === BISHOP ? BISHOP_DIRECTIONS : type === ROOK ? ROOK_DIRECTIONS : QUEEN_DIRECTIONS;
      for (const direction of directions) {
        for (let target = from + direction; !(target & 0x88); target += direction) {
          const victim = board[target];
          if (victim) {
            if ((victim & BLACK) === enemy) moves[n++] = makeMoveCode(from, target, 0);
            break;
          }
          if (!tacticalOnly) moves[n++] = makeMoveCode(from, target, 0);
        }
      }
    }
    return n;
  }

  private generateCastling(moves: Int32Array, n: number, from: number): number {
    const { board, side, castling } = this;
    const home = side === WHITE ? E1 : E8;
    if (from !== home) return n;

    const kingSide = side === WHITE ? WHITE_KING_SIDE : BLACK_KING_SIDE;
    const queenSide = side === WHITE ? WHITE_QUEEN_SIDE : BLACK_QUEEN_SIDE;
    const enemy = side ^ BLACK;
    if (!(castling & (kingSide | queenSide)) || this.isAttacked(home, enemy)) return n;

    // The king's destination is checked by the general legality test in `make`.
    if (castling & kingSide && !board[home + 1] && !board[home + 2] && !this.isAttacked(home + 1, enemy)) {
      moves[n++] = makeMoveCode(home, home + 2, FLAG_CASTLE);
    }
    if (
      castling & queenSide &&
      !board[home - 1] &&
      !board[home - 2] &&
      !board[home - 3] &&
      !this.isAttacked(home - 1, enemy)
    ) {
      moves[n++] = makeMoveCode(home, home - 2, FLAG_CASTLE);
    }
    return n;
  }

  private toggle(piece: number, sq: number) {
    this.hashLo ^= PIECE_KEYS_LO[piece * 128 + sq];
    this.hashHi ^= PIECE_KEYS_HI[piece * 128 + sq];
  }

  private setEnPassant(sq: number) {
    if (this.enPassant !== -1) {
      this.hashLo ^= EN_PASSANT_KEYS_LO[this.enPassant];
      this.hashHi ^= EN_PASSANT_KEYS_HI[this.enPassant];
    }
    this.enPassant = sq;
    if (sq !== -1) {
      this.hashLo ^= EN_PASSANT_KEYS_LO[sq];
      this.hashHi ^= EN_PASSANT_KEYS_HI[sq];
    }
  }

  private flipSide() {
    this.side ^= BLACK;
    this.hashLo ^= SIDE_KEY_LO;
    this.hashHi ^= SIDE_KEY_HI;
  }

  private push(move: number, captured: number) {
    const i = this.count++;
    this.undoMove[i] = move;
    this.undoCaptured[i] = captured;
    this.undoCastling[i] = this.castling;
    this.undoEnPassant[i] = this.enPassant;
    this.undoHalfmove[i] = this.halfmove;
    this.historyLo[i] = this.hashLo;
    this.historyHi[i] = this.hashHi;
  }

  /** Plays a pseudo-legal move. Returns false (and takes it back) if it leaves the own king in check. */
  make(move: number): boolean {
    const board = this.board;
    const from = moveFrom(move);
    const to = moveTo(move);
    const flags = moveFlags(move);
    const piece = board[from];
    const side = this.side;

    let captured = board[to];
    let capturedSquare = to;
    if (flags & FLAG_EN_PASSANT) {
      capturedSquare = to + (side === WHITE ? 16 : -16);
      captured = board[capturedSquare];
    }
    this.push(move, captured);

    if (captured) {
      this.toggle(captured, capturedSquare);
      board[capturedSquare] = 0;
    }
    this.toggle(piece, from);
    board[from] = 0;
    const placed = flags & FLAG_PROMOTION ? side | QUEEN : piece;
    board[to] = placed;
    this.toggle(placed, to);

    if (flags & FLAG_CASTLE) {
      const kingSide = to > from;
      const rookFrom = kingSide ? from + 3 : from - 4;
      const rookTo = kingSide ? from + 1 : from - 1;
      const rook = board[rookFrom];
      board[rookFrom] = 0;
      board[rookTo] = rook;
      this.toggle(rook, rookFrom);
      this.toggle(rook, rookTo);
    }
    if ((piece & 7) === KING) this.kings[side >> 3] = to;

    this.setEnPassant(flags & FLAG_DOUBLE_STEP ? (from + to) >> 1 : -1);

    const castling = this.castling & CASTLING_KEEP[from] & CASTLING_KEEP[to];
    if (castling !== this.castling) {
      this.hashLo ^= CASTLING_KEYS_LO[this.castling] ^ CASTLING_KEYS_LO[castling];
      this.hashHi ^= CASTLING_KEYS_HI[this.castling] ^ CASTLING_KEYS_HI[castling];
      this.castling = castling;
    }

    this.halfmove = captured || (piece & 7) === PAWN ? 0 : this.halfmove + 1;
    this.flipSide();

    if (this.isAttacked(this.kings[side >> 3], this.side)) {
      this.unmake();
      return false;
    }
    return true;
  }

  unmake() {
    const i = --this.count;
    const move = this.undoMove[i];
    const board = this.board;
    const from = moveFrom(move);
    const to = moveTo(move);
    const flags = moveFlags(move);

    this.side ^= BLACK;
    const side = this.side;
    const piece = flags & FLAG_PROMOTION ? side | PAWN : board[to];
    board[from] = piece;
    board[to] = 0;

    const captured = this.undoCaptured[i];
    if (flags & FLAG_EN_PASSANT) {
      board[to + (side === WHITE ? 16 : -16)] = captured;
    } else {
      board[to] = captured;
    }

    if (flags & FLAG_CASTLE) {
      const kingSide = to > from;
      const rookFrom = kingSide ? from + 3 : from - 4;
      const rookTo = kingSide ? from + 1 : from - 1;
      board[rookFrom] = board[rookTo];
      board[rookTo] = 0;
    }
    if ((piece & 7) === KING) this.kings[side >> 3] = from;

    this.castling = this.undoCastling[i];
    this.enPassant = this.undoEnPassant[i];
    this.halfmove = this.undoHalfmove[i];
    this.hashLo = this.historyLo[i];
    this.hashHi = this.historyHi[i];
  }

  /** Passes the move (for null-move pruning). */
  makeNull() {
    this.push(0, 0);
    this.setEnPassant(-1);
    this.halfmove++;
    this.flipSide();
  }

  unmakeNull() {
    const i = --this.count;
    this.side ^= BLACK;
    this.enPassant = this.undoEnPassant[i];
    this.halfmove = this.undoHalfmove[i];
    this.hashLo = this.historyLo[i];
    this.hashHi = this.historyHi[i];
  }

  /** True if the current position already occurred (in the game or the search line). */
  isRepetition(): boolean {
    const stop = Math.max(0, this.count - this.halfmove);
    for (let i = this.count - 2; i >= stop; i -= 2) {
      if (this.historyLo[i] === this.hashLo && this.historyHi[i] === this.hashHi) return true;
    }
    return false;
  }

  hasNonPawnMaterial(side: number): boolean {
    for (let sq = 0; sq < 128; sq++) {
      const piece = this.board[sq];
      if (sq & 0x88 || !piece || (piece & BLACK) !== side) continue;
      const type = piece & 7;
      if (type !== PAWN && type !== KING) return true;
    }
    return false;
  }

  /** The current position as a plain object (the inverse of the constructor). */
  snapshot(): BotPosition {
    const board: number[] = [];
    for (let i = 0; i < 64; i++) board.push(this.board[to0x88(i)]);
    return {
      board,
      side: this.side,
      castling: this.castling,
      enPassant: this.enPassant === -1 ? -1 : to64(this.enPassant),
    };
  }

  /** All legal moves (slow path, used at the root and by the opening book). */
  legalMoves(): number[] {
    const buffer = new Int32Array(256);
    const n = this.generate(buffer, false);
    const legal: number[] = [];
    for (let i = 0; i < n; i++) {
      if (this.make(buffer[i])) {
        legal.push(buffer[i]);
        this.unmake();
      }
    }
    return legal;
  }
}
