// Piece templates for creating new pieces
export const PIECE_PRESETS = [
  {
    id: 'K',
    name: "King",
    description: "Moves one square orthogonally or diagonally.",
    sprite: "king",
    moves: [
      {
        type: "ride",
        conditions: [],
        offsets: [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]],
        range: 1,
      },
      {
        type: "castle",
        selfConditions: ["initial"],
        targetPieces: ['r'],
        targetConditions: ["initial"],
        otherSquares: [[1, 0, '-'], [2, 0, '-']],
        targetPos: [3, 0],
        selfOffset: [2, 0],
        targetOffset: [-2, 0],
      },
      {
        type: "castle",
        selfConditions: ["initial"],
        targetPieces: ['r'],
        targetConditions: ["initial"],
        otherSquares: [[-1, 0, '-'], [-2, 0, '-'], [-3, 0, '-']],
        targetPos: [-4, 0],
        selfOffset: [-2, 0],
        targetOffset: [3, 0],
      },
      {
        type: "castle",
        selfConditions: ["initial"],
        targetPieces: ['r'],
        targetConditions: ["initial"],
        otherSquares: [[-1, 0, '-'], [-2, 0, '-']],
        targetPos: [-3, 0],
        selfOffset: [-2, 0],
        targetOffset: [2, 0],
      },
      {
        type: "castle",
        selfConditions: ["initial"],
        targetPieces: ['r'],
        targetConditions: ["initial"],
        otherSquares: [[1, 0, '-'], [2, 0, '-'], [3, 0, '-']],
        targetPos: [4, 0],
        selfOffset: [2, 0],
        targetOffset: [-3, 0],
      },
    ],
    promotions: [],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'P',
    name: "Pawn",
    description: "Moves one square straight forward (except on its first move, when it may move two squares), but captures one square diagonally forward.",
    sprite: "pawn",
    moves: [
      {
        type: "ride",
        conditions: ["non-capture only"],
        offsets: [[0, 1]],
        range: 1,
      },
      {
        type: "ride",
        conditions: ["initial", "non-capture only"],
        offsets: [[0, 2]],
        range: 1,
      },
      {
        type: "ride",
        conditions: ["capture only"],
        offsets: [[1, 1], [-1, 1]],
        range: 1,
      },
    ],
    promotions: [{
      squares: [[0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7]],
      becomes: ['n', 'b', 'r', 'q'],
    }],
    isEnPassantTarget: true,
    isEnPassantCapturer: true,
  },
  {
    id: 'N',
    name: "Knight",
    description: "Moves two squares in one direction (orthogonally) and then one square at a right angle to that direction.",
    sprite: "knight",
    moves: [
      {
        type: "leap",
        conditions: [],
        offsets: [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]],
      },
    ],
    promotions: [],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'B',
    name: "Bishop",
    description: "Moves diagonally across any number of squares.",
    sprite: "bishop",
    moves: [
      {
        type: "ride",
        conditions: [],
        offsets: [[1, 1], [-1, 1], [-1, -1], [1, -1]],
        range: Infinity,
      },
    ],
    promotions: [],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'R',
    name: "Rook",
    description: "Moves orthogonally across any number of squares.",
    sprite: "rook",
    moves: [
      {
        type: "ride",
        conditions: [],
        offsets: [[1, 0], [0, 1], [-1, 0], [0, -1]],
        range: Infinity,
      },
    ],
    promotions: [],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'Q',
    name: "Queen",
    description: "Moves orthogonally or diagonally across any number of squares.",
    sprite: "queen",
    moves: [
      {
        type: "ride",
        conditions: [],
        offsets: [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]],
        range: Infinity,
      },
    ],
    promotions: [],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'H',
    name: "Archbishop",
    description: "Combines the power of the knight and bishop. (Also known as: Princess, Cardinal)",
    sprite: "archbis",
    moves: [
      {
        type: "ride",
        conditions: [],
        offsets: [[1, 1], [-1, 1], [-1, -1], [1, -1]],
        range: Infinity,
      },
      {
        type: "leap",
        conditions: [],
        offsets: [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]],
      },
    ],
    promotions: [],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'E',
    name: "Chancellor",
    description: "Combines the power of the knight and rook. (Also known as: Empress, Marshal)",
    sprite: "chancel",
    moves: [
      {
        type: "ride",
        conditions: [],
        offsets: [[1, 0], [0, 1], [-1, 0], [0, -1]],
        range: Infinity,
      },
      {
        type: "leap",
        conditions: [],
        offsets: [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]],
      },
    ],
    promotions: [],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'A',
    name: "Amazon",
    description: "Combines the power of the knight and queen. (Also known as: Dragon)",
    sprite: "amazon",
    moves: [
      {
        type: "ride",
        conditions: [],
        offsets: [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]],
        range: Infinity,
      },
      {
        type: "leap",
        conditions: [],
        offsets: [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]],
      },
    ],
    promotions: [],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
];

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
  rules: {
    onCheckmateLastRoyal: "win",
    onCaptureLastRoyal: null,
    onStalemate: "draw",
    onThirdRepetition: "draw",
    onOpponentWipe: null,
  }
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
]
