import { PIECE_PRESETS } from "@/lib/piecePresets";

// Standard chess variant specifications
export const DEFAULT_VARIANT = {
  width: 8,
  height: 8,
  gridType: "square",
  playerCount: 2,
  board: Array.from({ length: 8 }, (_, i) => {
    const row = [];
    for (let j = 0; j < 8; j++) {
      let piece = null;
      let color = null;

      if (i === 0) {
        piece = 'RNBQKBNR'[j];
        color = 1;
      } else if (i === 1) {
        piece = 'P';
        color = 1;
      } else if (i === 6) {
        piece = 'P';
        color = 0;
      } else if (i === 7) {
        piece = 'RNBQKBNR'[j];
        color = 0;
      }

      row.push({ isValid: true, piece: piece ?? null, color: color ?? null });
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
  nMoveRulePieces: [],
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

export const EMPTY_GAME_CONFIG = {
  name: "New Variant",
  description: "",
  width: 8,
  height: 8,
  isWinOnCheckmate: false,
  mustCheckmateAllRoyals: false,
  isWinOnStalemate: false,
  isWinOnOpponentWipe: false,
  isDrawOnNMoveRule: false,
  nMoveRuleCount: 50,
  nMoveRulePieces: [],
}

export const EMPTY_PIECE_CONFIG = {
  id: "",
  name: "New Piece",
  description: "",
  sprite: "",
  moves: [],
  promotions: [],
  isEnPassantTarget: false,
  isEnPassantCapturer: false,
};

export const EMPTY_MOVE_PROPERTY = (moveType, direction = null, existingMove = {}) => {
  const {
    canNonCapture = true,
    canCapture = true,
    isInitialOnly = false,
  } = existingMove;

  const baseMove = {
    canNonCapture,
    canCapture,
    isInitialOnly,
  };

  if (moveType === "slide") {
    return {
      ...baseMove,
      type: "slide",
      offset: direction === "orthogonal" ? [1, 0] : direction === "diagonal" ? [1, 1] : [2, 1],
      canForward: true,
      canBackward: true,
      canSideways: true,
      range: { from: 1, to: 1 },
    };
  }

  if (moveType === "leap") {
    return {
      ...baseMove,
      type: "leap",
      offset: [2, 1],
      canForward: true,
      canBackward: true,
      canSideways: true,
    };
  }

  if (moveType === "hop") {
    return {
      ...baseMove,
      type: "hop",
      offset: direction === "orthogonal" ? [1, 0] : direction === "diagonal" ? [1, 1] : [1, 0],
      canForward: true,
      canBackward: true,
      canSideways: true,
      range: { from: 1, to: 1 },
    };
  }
};
