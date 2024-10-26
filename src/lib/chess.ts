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
  pieces: [
    {
      // Shorthand for notation (also used as ID)
      id: 'p',

      // Display name
      name: "Pawn",

      // SVG title in assets (without color)
      sprite: "pawn",

      // Not allowed to be captured, or the capture would result in a loss
      isRoyal: false,

      /**
       * type: "leap" => move directly to offsets (can jump over pieces)
       * type: "ride" => move in one direction within range (cannot jump over pieces)
       * type: "hop" => can only move by jumping over another piece(s)
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
          conditions: ["capture only"],
          offsets: [[1, 1], [-1, 1]],
          range: 1,
        },
      ],

      promotions: [{
        squares: [[0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7]],
        becomes: ['n', 'b', 'r', 'q'],
      }],

      // Can be targeted for En Passant
      isEnPassantTarget: true,

      // Can capture via En Passant
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
  const currentWidth = variant.width;
  const currentHeight = variant.height;

  let newBoard = [...variant.board];

  if (newHeight > currentHeight) {
    for (let i = currentHeight; i < newHeight; i++) {
      const newRow = [];
      for (let j = 0; j < currentWidth; j++) {
        newRow.push({ isValid: true, piece: null, color: null });
      }
      newBoard.push(newRow);
    }
  } else if (newHeight < currentHeight) {
    newBoard = newBoard.slice(0, newHeight);
  }

  newBoard = newBoard.map((row, i) => {
    if (newWidth > currentWidth) {
      for (let j = currentWidth; j < newWidth; j++) {
        row.push({ isValid: true, piece: null, color: null });
      }
    } else if (newWidth < currentWidth) {
      row = row.slice(0, newWidth);
    }
    return row;
  });

  return { ...variant, width: newWidth, height: newHeight, board: newBoard };
};

export const getSquareName = (width, height, rowIndex, colIndex) => {
  if (rowIndex < 0 || rowIndex >= height || colIndex < 0 || colIndex >= width) {
    throw new Error("Invalid indices");
  }

  const file = String.fromCharCode(97 + colIndex);  
  const rank = height - rowIndex;
  return `${file}${rank}`;
};

export const getReachableSquares = (moves, radius) => {
  const squares = Array.from({ length: radius * 2 + 1 }, () => 
    Array.from({ length: radius * 2 + 1 }, () => ({
      canMove: false,
      canCapture: false,
      onlyOnInitial: false,
    }))
  );

  moves.forEach((move) => {
    if (move.type === "ride") {
      for (let r = 1; r <= (move.range === Infinity ? radius : move.range); r++) {
        move.offsets.forEach(([dx, dy]) => {
          const x = radius + dx * r;
          const y = radius - dy * r;

          if (x >= 0 && x < squares.length && y >= 0 && y < squares[0].length) {
            squares[y][x] = {
              canMove: !move.conditions.some(condition => condition === "capture only"),
              canCapture: move.captureTargets.length > 0,
              onlyOnInitial: move.conditions.some(condition => condition === "initial"),
            };
          }
        });
      }
    } else if (move.type === "leap") {
      move.offsets.forEach(([dx, dy]) => {
        const x = radius + dx;
        const y = radius - dy;

        if (x >= 0 && x < squares.length && y >= 0 && y < squares[0].length) {
          squares[y][x] = {
            canMove: true,
            canCapture: move.captureTargets.length > 0,
            onlyOnInitial: false,
          };
        }
      });
    }
  });

  return squares;
};

export const deletePiece = (variant, pieceId) => {
  const newVariant = {
    ...variant,
    board: variant.board.map(row => 
      row.map(square => ({
        ...square,
        piece: square.piece?.id === pieceId ? null : square.piece,
      }))
    ),
    pieces: variant.pieces.filter(piece => piece.id !== pieceId),
  };

  newVariant.pieces = newVariant.pieces.map(piece => {
    const updatedMoves = piece.moves.map(move => {
      const updatedCaptureTargets = move.captureTargets.filter(targetId => targetId !== pieceId);
      const updatedTargetPieces = move.type === "castle" ? 
        move.targetPieces.filter(targetId => targetId !== pieceId) : 
        move.targetPieces;

      return {
        ...move,
        captureTargets: updatedCaptureTargets,
        targetPieces: updatedTargetPieces,
      };
    })
    .filter(move => !(move.type === "castle" && move.targetPieces.length === 0));

    return {
      ...piece,
      moves: updatedMoves,
    };
  });

  return newVariant;
};
