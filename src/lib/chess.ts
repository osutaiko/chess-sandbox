export const DEFAULT_VARIANT = {
  board: Array.from({ length: 8 }, (_, i) => {
    const row = [];
    for (let j = 0; j < 8; j++) {
      const square = `${String.fromCharCode(97 + j)}${8 - i}`;
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

      row.push({ square, piece: piece || null, color: color || null });
    }
    return row;
  }),
  pieces: [
    {
      // Shorthand for notation (also used as ID)
      id: 'p',

      // Display name
      name: "Pawn",

      // Not allowed to be captured, or the capture would result in a loss
      isRoyal: false,

      /**
       * type: "leap" => move directly to offsets (can jump over pieces)
       * type: "ride" => move in one direction (cannot jump over pieces)
       * type: "hop" => jump over pieces (requires hurdle piece)
       */
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
          conditions: [],
          offsets: [[1, 1], [-1, 1]],
          range: 1,
        },
      ],

      // Can be targeted for En Passant
      isEnPassantTarget: true,

      // Can capture via En Passant
      isEnPassantCapturer: true,
    },
    {
      id: 'n',
      name: "Knight",
      isRoyal: false,
      moves: [
        {
          type: "ride",
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
          selfConditions: ["initial", "not under attack"],
          targetConditions: ["initial"],
          otherSquares: [[1, 0, '-'], [2, 0, '-']],
          targetPos: [3, 0],
          selfOffset: [2, 0],
          targetOffset: [-2, 0],
        },
        {
          type: "castle",
          captureTargets: [],
          selfConditions: ["initial", "not under attack"],
          targetConditions: ["initial"],
          otherSquares: [[-1, 0, '-'], [-2, 0, '-'], [-3, 0, '-']],
          targetPos: [-4, 0],
          selfOffset: [-2, 0],
          targetOffset: [3, 0],
        },
        {
          type: "castle",
          captureTargets: [],
          selfConditions: ["initial", "not under attack"],
          targetConditions: ["initial"],
          otherSquares: [[-1, 0, '-'], [-2, 0, '-']],
          targetPos: [-3, 0],
          selfOffset: [-2, 0],
          targetOffset: [2, 0],
        },
        {
          type: "castle",
          captureTargets: [],
          selfConditions: ["initial", "not under attack"],
          targetConditions: ["initial"],
          otherSquares: [[1, 0, '-'], [2, 0, '-'], [3, 0, '-']],
          targetPos: [4, 0],
          selfOffset: [2, 0],
          targetOffset: [-3, 0],
        },
      ],
      isEnPassantTarget: false,
      isEnPassantCapturer: false,
    }
  ],
  rules: {
    onCheckmateLastRoyal: "win",
    onCaptureLastRoyal: null,
    onStalemate: "draw",
    onThirdRepetition: "draw",
    onOpponentWipe: null,
  }
};

export const resizeBoard = (variant, newWidth, newHeight) => {
  const currentWidth = variant.board[0].length;
  const currentHeight = variant.board.length;

  let newBoard = [...variant.board];

  if (newHeight > currentHeight) {
    for (let i = currentHeight; i < newHeight; i++) {
      const newRow = [];
      for (let j = 0; j < currentWidth; j++) {
        const square = `${String.fromCharCode(97 + j)}${8 - i}`;
        newRow.push({ square, piece: null, color: null });
      }
      newBoard.push(newRow);
    }
  } else if (newHeight < currentHeight) {
    newBoard = newBoard.slice(0, newHeight);
  }

  newBoard = newBoard.map((row, i) => {
    if (newWidth > currentWidth) {
      for (let j = currentWidth; j < newWidth; j++) {
        const square = `${String.fromCharCode(97 + j)}${8 - i}`;
        row.push({ square, piece: null, color: null });
      }
    } else if (newWidth < currentWidth) {
      row = row.slice(0, newWidth);
    }
    return row;
  });

  return { ...variant, board: newBoard };
};

export const getSquareName = (width, height, rowIndex, colIndex) => {
  if (rowIndex < 0 || rowIndex >= height || colIndex < 0 || colIndex >= width) {
    throw new Error("Invalid indices");
  }

  const file = String.fromCharCode(97 + colIndex);  
  const rank = height - rowIndex;

  return `${file}${rank}`;
};
