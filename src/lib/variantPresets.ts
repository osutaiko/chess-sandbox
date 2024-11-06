import { Variant, VariantGridType } from "@/lib/types";
import { PIECE_PRESETS } from "@/lib/piecePresets";

export const VARIANT_PRESETS: Variant[] = [
  {
    name: "Standard Chess",
    description: "The standard chess variant.",
    width: 8,
    height: 8,
    gridType: "square" as VariantGridType,
    playerCount: 2,
    board: Array.from({ length: 8 }, (_, i) => {
      const row = [];
      for (let j = 0; j < 8; j++) {
        let pieceId = null;
        let color = null;
  
        if (i === 0) {
          pieceId = 'RNBQKBNR'[j];
          color = 1;
        } else if (i === 1) {
          pieceId = 'P';
          color = 1;
        } else if (i === 6) {
          pieceId = 'P';
          color = 0;
        } else if (i === 7) {
          pieceId = 'RNBQKBNR'[j];
          color = 0;
        }
  
        row.push({ isValid: true, pieceId: pieceId ?? null, color: color ?? null });
      }
      return row;
    }),
    pieces: PIECE_PRESETS.filter(p => ['K', 'P', 'N', 'B', 'R', 'Q'].includes(p.id)),
    royals: ['K'],
    isWinOnCheckmate: true,
    mustCheckmateAllRoyals: true,
    isWinOnStalemate: false,
    isWinOnOpponentWipe: false,
    nMoveRuleCount: 50,
    nMoveRulePieces: ['P'],
  },
  {
    name: "Capablanca Chess",
    description: "A chess variant featuring archbishops and chancellors, by José Capablanca.",
    width: 10,
    height: 8,
    gridType: "square" as VariantGridType,
    playerCount: 2,
    board: Array.from({ length: 8 }, (_, i) => {
      const row = [];
      for (let j = 0; j < 10; j++) {
        let pieceId = null;
        let color = null;
  
        if (i === 0) {
          pieceId = 'RNHBQKBENR'[j];
          color = 1;
        } else if (i === 1) {
          pieceId = 'P';
          color = 1;
        } else if (i === 6) {
          pieceId = 'P';
          color = 0;
        } else if (i === 7) {
          pieceId = 'RNHBQKBENR'[j];
          color = 0;
        }
  
        row.push({ isValid: true, pieceId: pieceId ?? null, color: color ?? null });
      }
      return row;
    }),
    pieces: PIECE_PRESETS.filter(p => ['K', 'P', 'N', 'B', 'R', 'Q', 'H', 'E'].includes(p.id)),
    royals: ['K'],
    isWinOnCheckmate: true,
    mustCheckmateAllRoyals: true,
    isWinOnStalemate: false,
    isWinOnOpponentWipe: false,
    nMoveRuleCount: 50,
    nMoveRulePieces: ['P'],
  },
  {
    name: "Los Alamos Chess",
    description: "Chess played on a 6x6 board; the first chess-like game played by a computer.",
    width: 6,
    height: 6,
    gridType: "square" as VariantGridType,
    playerCount: 2,
    board: Array.from({ length: 6 }, (_, i) => {
      const row = [];
      for (let j = 0; j < 8; j++) {
        let pieceId = null;
        let color = null;
  
        if (i === 0) {
          pieceId = 'RNQKNR'[j];
          color = 1;
        } else if (i === 1) {
          pieceId = 'P';
          color = 1;
        } else if (i === 4) {
          pieceId = 'P';
          color = 0;
        } else if (i === 5) {
          pieceId = 'RNQKNR'[j];
          color = 0;
        }
  
        row.push({ isValid: true, pieceId: pieceId ?? null, color: color ?? null });
      }
      return row;
    }),
    pieces: PIECE_PRESETS.filter(p => ['K', 'P', 'N', 'R', 'Q'].includes(p.id)),
    royals: ['K'],
    isWinOnCheckmate: true,
    mustCheckmateAllRoyals: true,
    isWinOnStalemate: false,
    isWinOnOpponentWipe: false,
    nMoveRuleCount: 30,
    nMoveRulePieces: ['P'],
  },
];
