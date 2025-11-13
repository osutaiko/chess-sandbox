import { PIECE_PRESETS } from "@/lib/piecePresets";
import { MoveType, PieceMove, VariantGridType } from "@/lib/types";

// Standard chess variant specifications
export const DEFAULT_VARIANT = {
  name: "New Variant",
  description: "",
  width: 8,
  height: 8,
  gridType: "square" as VariantGridType,
  playerCount: 2,
  initialBoard: Array.from({ length: 8 }, (_, i) => {
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
};

export const AVAILABLE_SPRITES = [
  "amazon",
  "archbis",
  "augna",
  "augnd",
  "augnf",
  "augnw",
  "bishop",
  "bpawn",
  "bpawn2",
  "centaur",
  "chancel",
  "commonr",
  "giraffe",
  "grassh",
  "king",
  "knight",
  "nightrd",
  "nrking",
  "pawn",
  "queen",
  "rknight",
  "rook",
  "rook4",
  "rqueen",
  "zebra"
];

export const EMPTY_PIECE_CONFIG = {
  id: "",
  name: "New Piece",
  description: "",
  sprite: "",
  moves: [],
  promotions: [],
  /* isEnPassantTarget: false,
  isEnPassantCapturer: false, */
};

export const EMPTY_MOVE_PROPERTY = (
  moveType: MoveType,
  direction: string,
  existingMove: Partial<PieceMove> = {}
): PieceMove => {
  const {
    canNonCapture = true,
    canCapture = true,
    isInitialOnly = false,
  } = existingMove;

  if (moveType === "slide") {
    return {
      type: "slide",
      offset: direction === "orthogonal" ? [1, 0] : direction === "diagonal" ? [1, 1] : [2, 1],
      canForward: true,
      canBackward: true,
      canSideways: true,
      range: { from: 1, to: 1 },
      canNonCapture,
      canCapture,
      isInitialOnly,
    };
  }

  if (moveType === "leap") {
    return {
      type: "leap",
      offset: [2, 1],
      range: {
        from: 1,
        to: 1,
      },
      canForward: true,
      canBackward: true,
      canSideways: true,
      canNonCapture,
      canCapture,
      isInitialOnly,
    };
  }

  if (moveType === "hop") {
    return {
      type: "hop",
      offset: direction === "orthogonal" ? [1, 0] : direction === "diagonal" ? [1, 1] : [1, 0],
      canForward: true,
      canBackward: true,
      canSideways: true,
      range: { from: 1, to: 1 },
      canNonCapture,
      canCapture,
      isInitialOnly,
    };
  }

  throw new Error(`Invalid move type: ${moveType}`);
};
