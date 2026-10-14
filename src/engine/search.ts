import { evaluate, PIECE_VALUES } from "./evaluate";
import {
  FLAG_EN_PASSANT,
  FLAG_PROMOTION,
  moveFlags,
  moveFrom,
  moveTo,
  PAWN,
  Position,
} from "./position";

/**
 * Iterative-deepening negamax with alpha-beta, principal variation search, a transposition
 * table, null-move pruning, late move reductions, check extensions and a quiescence search.
 */

export const MATE = 30000;
const MATE_BOUND = MATE - 1000;
const INFINITY = 32000;
const MAX_PLY = 96;

const EXACT = 0;
const LOWER = 1;
const UPPER = 2;

const TT_BITS = 20;
const TT_SIZE = 1 << TT_BITS;
const TT_MASK = TT_SIZE - 1;

export interface SearchResult {
  move: number;
  /** Centipawns from the bot's point of view; above MATE_BOUND means a forced mate. */
  score: number;
  depth: number;
  nodes: number;
}

// Shared between searches: allocating 1M-entry tables per move would be wasteful.
const ttLo = new Int32Array(TT_SIZE);
const ttHi = new Int32Array(TT_SIZE);
const ttMove = new Int32Array(TT_SIZE);
const ttScore = new Int16Array(TT_SIZE);
const ttDepth = new Int8Array(TT_SIZE);
const ttBound = new Uint8Array(TT_SIZE);

const moveLists = Array.from({ length: MAX_PLY + 1 }, () => new Int32Array(256));
const moveScores = Array.from({ length: MAX_PLY + 1 }, () => new Int32Array(256));
const killers = new Int32Array(MAX_PLY * 2);
const history = new Int32Array(16 * 128);

export const isMateScore = (score: number) => Math.abs(score) > MATE_BOUND;

const toTable = (score: number, ply: number) =>
  score > MATE_BOUND ? score + ply : score < -MATE_BOUND ? score - ply : score;
const fromTable = (score: number, ply: number) =>
  score > MATE_BOUND ? score - ply : score < -MATE_BOUND ? score + ply : score;

export function search(position: Position, timeLimitMs: number, maxDepth = 64): SearchResult {
  const deadline = Date.now() + timeLimitMs;
  let nodes = 0;
  let stopped = false;
  let rootBest = 0;

  killers.fill(0);
  history.fill(0);

  const isCapture = (move: number) =>
    position.board[moveTo(move)] !== 0 || (moveFlags(move) & FLAG_EN_PASSANT) !== 0;

  /**
   * Higher first: table move, promotions, captures (most valuable victim, least valuable
   * attacker), killers, history.
   */
  function scoreMoves(n: number, ply: number, hashMove: number) {
    const moves = moveLists[ply];
    const scores = moveScores[ply];
    const board = position.board;
    for (let i = 0; i < n; i++) {
      const move = moves[i];
      const to = moveTo(move);
      const attacker = board[moveFrom(move)];
      const promotionBonus = moveFlags(move) & FLAG_PROMOTION ? 500_000 : 0;
      if (move === hashMove) {
        scores[i] = 2_000_000;
      } else if (isCapture(move)) {
        const victim = board[to] & 7 || PAWN;
        scores[i] = 1_000_000 + promotionBonus + PIECE_VALUES[victim] * 10 - PIECE_VALUES[attacker & 7];
      } else if (promotionBonus) {
        scores[i] = 1_400_000;
      } else if (move === killers[ply * 2]) {
        scores[i] = 800_000;
      } else if (move === killers[ply * 2 + 1]) {
        scores[i] = 700_000;
      } else {
        scores[i] = history[attacker * 128 + to];
      }
    }
  }

  /** Selection sort step: brings the best remaining move to index `i`. */
  function pickMove(ply: number, i: number, n: number): number {
    const moves = moveLists[ply];
    const scores = moveScores[ply];
    let best = i;
    for (let j = i + 1; j < n; j++) if (scores[j] > scores[best]) best = j;
    const move = moves[best];
    moves[best] = moves[i];
    moves[i] = move;
    const score = scores[best];
    scores[best] = scores[i];
    scores[i] = score;
    return move;
  }

  function checkTime() {
    if ((++nodes & 2047) === 0 && Date.now() > deadline) stopped = true;
  }

  function quiesce(alpha: number, beta: number, ply: number): number {
    checkTime();
    if (stopped) return 0;

    const standPat = evaluate(position);
    if (standPat >= beta) return standPat;
    if (standPat > alpha) alpha = standPat;
    if (ply >= MAX_PLY) return standPat;

    const n = position.generate(moveLists[ply], true);
    scoreMoves(n, ply, 0);

    for (let i = 0; i < n; i++) {
      const move = pickMove(ply, i, n);
      // Delta pruning: even winning this piece for free would not reach alpha.
      const gain = PIECE_VALUES[position.board[moveTo(move)] & 7 || PAWN];
      if (!(moveFlags(move) & FLAG_PROMOTION) && standPat + gain + 200 < alpha) continue;

      if (!position.make(move)) continue;
      const score = -quiesce(-beta, -alpha, ply + 1);
      position.unmake();
      if (stopped) return 0;

      if (score >= beta) return score;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  function negamax(depth: number, alpha: number, beta: number, ply: number, allowNull: boolean): number {
    checkTime();
    if (stopped) return 0;
    if (ply > 0 && position.isRepetition()) return 0;

    const inCheck = position.inCheck();
    if (inCheck) depth++;
    if (depth <= 0) return quiesce(alpha, beta, ply);
    if (ply >= MAX_PLY) return evaluate(position);

    const isPv = beta - alpha > 1;
    const index = position.hashLo & TT_MASK;
    let hashMove = 0;
    if (ttLo[index] === position.hashLo && ttHi[index] === position.hashHi) {
      hashMove = ttMove[index];
      if (!isPv && ply > 0 && ttDepth[index] >= depth) {
        const score = fromTable(ttScore[index], ply);
        const bound = ttBound[index];
        if (bound === EXACT) return score;
        if (bound === LOWER && score >= beta) return score;
        if (bound === UPPER && score <= alpha) return score;
      }
    }

    // Null move: if passing still beats beta, a real move surely will.
    if (allowNull && !isPv && !inCheck && depth >= 3 && position.hasNonPawnMaterial(position.side)) {
      if (evaluate(position) >= beta) {
        position.makeNull();
        const score = -negamax(depth - 3, -beta, -beta + 1, ply + 1, false);
        position.unmakeNull();
        if (stopped) return 0;
        if (score >= beta && !isMateScore(score)) return beta;
      }
    }

    const n = position.generate(moveLists[ply], false);
    scoreMoves(n, ply, hashMove);

    const alphaStart = alpha;
    let best = -INFINITY;
    let bestMove = 0;
    let legal = 0;

    for (let i = 0; i < n; i++) {
      const move = pickMove(ply, i, n);
      const quiet = !isCapture(move) && !(moveFlags(move) & FLAG_PROMOTION);
      const piece = position.board[moveFrom(move)];
      if (!position.make(move)) continue;
      legal++;

      let score: number;
      if (legal === 1) {
        score = -negamax(depth - 1, -beta, -alpha, ply + 1, true);
      } else {
        const givesCheck = position.inCheck();
        let reduction = 0;
        if (quiet && !inCheck && !givesCheck && depth >= 3 && legal > 3) {
          reduction = legal > 10 && depth >= 6 ? 2 : 1;
        }
        score = -negamax(depth - 1 - reduction, -alpha - 1, -alpha, ply + 1, true);
        if (score > alpha && (reduction > 0 || score < beta)) {
          score = -negamax(depth - 1, -beta, -alpha, ply + 1, true);
        }
      }
      position.unmake();
      if (stopped) return 0;

      if (score > best) {
        best = score;
        bestMove = move;
        if (ply === 0) rootBest = move;
        if (score > alpha) {
          alpha = score;
          if (alpha >= beta) {
            if (quiet) {
              if (killers[ply * 2] !== move) {
                killers[ply * 2 + 1] = killers[ply * 2];
                killers[ply * 2] = move;
              }
              history[piece * 128 + moveTo(move)] += depth * depth;
            }
            break;
          }
        }
      }
    }

    if (legal === 0) return inCheck ? -MATE + ply : 0;

    const bound = best >= beta ? LOWER : best > alphaStart ? EXACT : UPPER;
    ttLo[index] = position.hashLo;
    ttHi[index] = position.hashHi;
    ttMove[index] = bestMove;
    ttScore[index] = toTable(best, ply);
    ttDepth[index] = Math.min(depth, 127);
    ttBound[index] = bound;
    return best;
  }

  const legalMoves = position.legalMoves();
  let result: SearchResult = { move: legalMoves[0] ?? 0, score: 0, depth: 0, nodes: 0 };
  if (legalMoves.length <= 1) return result;

  for (let depth = 1; depth <= maxDepth; depth++) {
    rootBest = 0;
    const score = negamax(depth, -INFINITY, INFINITY, 0, false);

    // An unfinished iteration still counts if it already found a better move.
    if (stopped) {
      if (rootBest) result.move = rootBest;
      break;
    }
    result = { move: rootBest, score, depth, nodes };
    if (isMateScore(score) && MATE - Math.abs(score) <= depth) break;
    if (Date.now() > deadline) break;
  }

  return { ...result, nodes };
}
