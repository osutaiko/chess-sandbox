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
              canCapture: !move.conditions.some(condition => condition === "non-capture only"),
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
            canCapture: !move.conditions.some(condition => condition === "non-capture only"),
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
      const updatedTargetPieces = move.type === "castle" ? 
        move.targetPieces.filter(targetId => targetId !== pieceId) : 
        move.targetPieces;

      return {
        ...move,
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

export const removePieceFromBoard = (variant, rowIndex, colIndex) => {
  const updatedVariant = { ...variant };
  if (updatedVariant.board[rowIndex] && updatedVariant.board[rowIndex][colIndex]) {
    updatedVariant.board[rowIndex][colIndex].piece = null;
  }
  return updatedVariant;
};

export const addPieceToBoard = (variant, pieceId, color, rowIndex, colIndex) => {
  const updatedVariant = { ...variant };
  if (updatedVariant.board[rowIndex] && updatedVariant.board[rowIndex][colIndex]) {
    updatedVariant.board[rowIndex][colIndex] = {
      ...updatedVariant.board[rowIndex][colIndex],
      piece: pieceId,
      color: color
    };
  }
  return updatedVariant;
};
