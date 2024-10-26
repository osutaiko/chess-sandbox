// Piece templates for creating new pieces
export const PIECE_PRESETS = [
  {
    id: 'p',
    name: "Pawn",
    sprite: "pawn",
    isRoyal: false,
    moves: [
      {
        type: "ride",
        captureTargets: [],
        conditions: [],
        offsets: [[0, 1]],
        range: 1,
      },
      {
        type: "ride",
        captureTargets: [],
        conditions: ["initial"],
        offsets: [[0, 2]],
        range: 1,
      },
      {
        type: "ride",
        captureTargets: ['p', 'n', 'b', 'r', 'q'],
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
    id: 'n',
    name: "Knight",
    sprite: "knight",
    isRoyal: false,
    moves: [
      {
        type: "leap",
        captureTargets: ['p', 'n', 'b', 'r', 'q'],
        conditions: [],
        offsets: [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]],
      },
    ],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'b',
    name: "Bishop",
    sprite: "bishop",
    isRoyal: false,
    moves: [
      {
        type: "ride",
        captureTargets: ['p', 'n', 'b', 'r', 'q'],
        conditions: [],
        offsets: [[1, 1], [-1, 1], [-1, -1], [1, -1]],
        range: Infinity,
      },
    ],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'r',
    name: "Rook",
    sprite: "rook",
    isRoyal: false,
    moves: [
      {
        type: "ride",
        captureTargets: ['p', 'n', 'b', 'r', 'q'],
        conditions: [],
        offsets: [[1, 0], [0, 1], [-1, 0], [0, -1]],
        range: Infinity,
      },
    ],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'q',
    name: "Queen",
    sprite: "queen",
    isRoyal: false,
    moves: [
      {
        type: "ride",
        captureTargets: ['p', 'n', 'b', 'r', 'q'],
        conditions: [],
        offsets: [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]],
        range: Infinity,
      },
    ],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'k',
    name: "King",
    sprite: "king",
    isRoyal: true,
    moves: [
      {
        type: "ride",
        captureTargets: ['p', 'n', 'b', 'r', 'q'],
        conditions: [],
        offsets: [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]],
        range: 1,
      },
      {
        type: "castle",
        captureTargets: [],
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
        captureTargets: [],
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
        captureTargets: [],
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
        captureTargets: [],
        selfConditions: ["initial"],
        targetPieces: ['r'],
        targetConditions: ["initial"],
        otherSquares: [[1, 0, '-'], [2, 0, '-'], [3, 0, '-']],
        targetPos: [4, 0],
        selfOffset: [2, 0],
        targetOffset: [-3, 0],
      },
    ],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'a',
    name: "Archbishop",
    sprite: "archbis",
    isRoyal: false,
    moves: [
      {
        type: "ride",
        captureTargets: ['p', 'n', 'b', 'r', 'q'],
        conditions: [],
        offsets: [[1, 1], [-1, 1], [-1, -1], [1, -1]],
        range: Infinity,
      },
      {
        type: "leap",
        captureTargets: ['p', 'n', 'b', 'r', 'q'],
        conditions: [],
        offsets: [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]],
      },
    ],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'c',
    name: "Chancellor",
    sprite: "chancel",
    isRoyal: false,
    moves: [
      {
        type: "ride",
        captureTargets: ['p', 'n', 'b', 'r', 'q'],
        conditions: [],
        offsets: [[1, 0], [0, 1], [-1, 0], [0, -1]],
        range: Infinity,
      },
      {
        type: "leap",
        captureTargets: ['p', 'n', 'b', 'r', 'q'],
        conditions: [],
        offsets: [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]],
      },
    ],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  },
  {
    id: 'd',
    name: "Amazon",
    sprite: "amazon",
    isRoyal: false,
    moves: [
      {
        type: "ride",
        captureTargets: ['p', 'n', 'b', 'r', 'q'],
        conditions: [],
        offsets: [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]],
        range: Infinity,
      },
      {
        type: "leap",
        captureTargets: ['p', 'n', 'b', 'r', 'q'],
        conditions: [],
        offsets: [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]],
      },
    ],
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
        piece = 'rnbqkbnr'[j];
        color = 1;
      } else if (i === 1) {
        piece = 'p';
        color = 1;
      } else if (i === 6) {
        piece = 'p';
        color = 0;
      } else if (i === 7) {
        piece = 'rnbqkbnr'[j];
        color = 0;
      }

      row.push({ isValid: true, piece: piece ?? null, color: color ?? null });
    }
    return row;
  }),
  pieces: PIECE_PRESETS.filter(p => ['p', 'r', 'n', 'b', 'q', 'k'].includes(p.id)),
  rules: {
    onCheckmateLastRoyal: "win",
    onCaptureLastRoyal: null,
    onStalemate: "draw",
    onThirdRepetition: "draw",
    onOpponentWipe: null,
  }
};
