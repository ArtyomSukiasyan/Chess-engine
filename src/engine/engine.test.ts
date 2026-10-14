import { describe, expect, it } from "vitest";
import { defaultCastlingConditions } from "../constants/castlingConditions";
import initializeBoard from "../helpers/board/initializeBoard";
import { EPlayer } from "../models/enums/Player.enum";
import { buildBook } from "./book";
import { chooseMove } from "./bot";
import { BOT_LEVELS, BotSettings } from "./levels";
import {
  appMoveToSan,
  findUciMove,
  fromFen,
  moveToSan,
  moveToUci,
  parseSquare,
  squareName,
  startPosition,
} from "./notation";
import { toBotPosition } from "./fromApp";
import { BotPosition, moveFrom, moveTo, Position, to64 } from "./position";
import { isMateScore, MATE, search } from "./search";

const settings = (timeLimitMs: number): BotSettings => ({
  timeLimitMs,
  maxDepth: 64,
  useBook: true,
  randomMoveChance: 0,
});

const START_FEN_FOR_SAN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function perft(position: Position, depth: number): number {
  if (depth === 0) return 1;
  const moves = new Int32Array(256);
  const n = position.generate(moves, false);
  let total = 0;
  for (let i = 0; i < n; i++) {
    if (!position.make(moves[i])) continue;
    total += perft(position, depth - 1);
    position.unmake();
  }
  return total;
}

/** Plays the bot against itself and returns the result after at most `maxPlies`. */
function selfPlay(start: BotPosition, maxPlies: number, timeLimitMs: number) {
  const position = new Position(start);
  for (let ply = 0; ply < maxPlies; ply++) {
    const legal = position.legalMoves();
    if (legal.length === 0) return { mated: position.inCheck(), ply };
    position.make(search(position, timeLimitMs).move);
  }
  return { mated: false, ply: maxPlies };
}

describe("move generation (perft)", () => {
  it("matches the reference counts from the starting position", () => {
    expect(perft(new Position(startPosition()), 4)).toBe(197_281);
  });

  it("handles castling, pins and en passant (Kiwipete)", () => {
    const position = new Position(
      fromFen("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -")
    );
    expect(perft(position, 3)).toBe(97_862);
  });

  it("handles en passant discovered checks (CPW position 3)", () => {
    const position = new Position(fromFen("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -"));
    expect(perft(position, 5)).toBe(674_624);
  });

  it("restores the position after make/unmake", () => {
    const position = new Position(startPosition());
    const hash = [position.hashLo, position.hashHi];
    perft(position, 3);
    expect([position.hashLo, position.hashHi]).toEqual(hash);
  });
});

describe("search", () => {
  it("finds a mate in one", () => {
    const position = new Position(fromFen("6k1/5ppp/8/8/8/8/8/R5K1 w - -"));
    const result = search(position, 1000);
    expect([to64(moveFrom(result.move)), to64(moveTo(result.move))]).toEqual([56, 0]);
    expect(isMateScore(result.score)).toBe(true);
  });

  it("finds a mate in two (rook roller)", () => {
    // 1. Rb7 Kg8 2. Ra8#
    const position = new Position(fromFen("7k/8/8/8/8/8/R7/1R4K1 w - -"));
    const result = search(position, 3000);
    expect(MATE - result.score).toBe(3);
  });

  it("does not mistake stalemate for mate", () => {
    // Qb6 would be stalemate; the bot must keep the game going while winning.
    const position = new Position(fromFen("k7/8/2Q5/8/8/8/8/6K1 w - -"));
    const result = search(position, 500);
    const next = new Position(fromFen("k7/8/2Q5/8/8/8/8/6K1 w - -"));
    next.make(result.move);
    expect(next.legalMoves().length).toBeGreaterThan(0);
  });

  it("mates with king and queen against a lone king", () => {
    const { mated } = selfPlay(fromFen("8/8/8/4k3/8/8/8/3QK3 w - -"), 60, 300);
    expect(mated).toBe(true);
  }, 60_000);

  it("mates with king and rook against a lone king", () => {
    const { mated } = selfPlay(fromFen("8/8/8/4k3/8/8/8/R3K3 w - -"), 100, 300);
    expect(mated).toBe(true);
  }, 120_000);

  it("wins a hanging queen", () => {
    const position = new Position(fromFen("rnb1kbnr/pppp1ppp/8/4p3/4P2q/5N2/PPPP1PPP/RNBQKB1R w KQkq -"));
    const result = search(position, 1000);
    // Nf3xh4
    expect([to64(moveFrom(result.move)), to64(moveTo(result.move))]).toEqual([45, 39]);
  });
});

describe("integration with the app", () => {
  it("converts the app's starting board", () => {
    const converted = toBotPosition(initializeBoard(), EPlayer.white, defaultCastlingConditions, -1);
    expect(converted).toEqual(startPosition());
  });

  it("has only legal lines in the opening book", () => {
    expect(() => buildBook()).not.toThrow();
  });

  it("opens with a book move, not a knight hop", () => {
    const move = chooseMove(startPosition(), [], settings(500))!;
    // e4, d4 or c4.
    expect([52, 51, 50]).toContain(move.start);
  });

  it("still finds a move when the position has already repeated", () => {
    const start = fromFen("8/8/8/4k3/8/8/8/3QK3 w - -");
    expect(chooseMove(start, [start, start], settings(300))).not.toBeNull();
  });
});

describe("notation", () => {
  it("round-trips UCI moves, including promotions", () => {
    const position = new Position(fromFen("8/4P3/8/8/8/8/k7/4K3 w - -"));
        expect(moveToUci(findUciMove(position, "e7e8q"))).toBe("e7e8q");
    expect(findUciMove(position, "e1e3")).toBe(0);
  });

  it("parses the en passant square from FEN", () => {
    const position = fromFen("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1");
    expect(position.enPassant).toBe(parseSquare("d6"));
    expect(squareName(position.enPassant)).toBe("d6");
  });

  const san = (fen: string, uci: string) => {
    const position = new Position(fromFen(fen));
    return moveToSan(position, findUciMove(position, uci));
  };

  it("writes moves in standard algebraic notation", () => {
    expect(san(START_FEN_FOR_SAN, "g1f3")).toBe("Nf3");
    expect(san(START_FEN_FOR_SAN, "e2e4")).toBe("e4");
    expect(san("4k3/8/8/3p4/4P3/8/8/4K3 w - -", "e4d5")).toBe("exd5");
    expect(san("4k3/8/8/3pP3/8/8/8/4K3 w - d6", "e5d6")).toBe("exd6");
    expect(san("r3k2r/8/8/8/8/8/8/R3K2R w KQkq -", "e1g1")).toBe("O-O");
    expect(san("r3k2r/8/8/8/8/8/8/R3K2R b KQkq -", "e8c8")).toBe("O-O-O");
    expect(san("8/4P3/8/8/8/8/k7/4K3 w - -", "e7e8q")).toBe("e8=Q");
    expect(san("6k1/5ppp/8/8/8/8/8/R5K1 w - -", "a1a8")).toBe("Ra8#");
  });

  it("disambiguates moves by file, rank or square", () => {
    expect(san("4k3/8/8/8/8/8/8/R4RK1 w - -", "a1d1")).toBe("Rad1");
    expect(san("4k3/R7/8/8/8/8/8/R3K3 w - -", "a1a4")).toBe("R1a4");
    expect(san("4k3/8/8/8/Q2Q4/8/8/Q5K1 w - -", "a4d1")).toBe("Qa4d1");
  });

  it("converts the app's moves", () => {
    expect(appMoveToSan(startPosition(), parseSquare("e2"), parseSquare("e4"))).toBe("e4");
    expect(appMoveToSan(startPosition(), parseSquare("e2"), parseSquare("e5"))).toBe("");
  });
});

describe("difficulty levels", () => {
  it("always finds a legal move, on every level", () => {
    const position = new Position(startPosition());
    const legal = position.legalMoves().map((m) => `${to64(moveFrom(m))}-${to64(moveTo(m))}`);
    for (const level of BOT_LEVELS) {
      const move = chooseMove(startPosition(), [], { ...level.settings, timeLimitMs: 50 })!;
      expect(legal).toContain(`${move.start}-${move.end}`);
    }
  });

  it("gets stronger from level to level", () => {
    const limits = BOT_LEVELS.map((level) => level.settings);
    for (let i = 1; i < limits.length; i++) {
      expect(limits[i].timeLimitMs).toBeGreaterThanOrEqual(limits[i - 1].timeLimitMs);
      expect(limits[i].maxDepth).toBeGreaterThanOrEqual(limits[i - 1].maxDepth);
      expect(limits[i].randomMoveChance).toBeLessThanOrEqual(limits[i - 1].randomMoveChance);
    }
  });
});
