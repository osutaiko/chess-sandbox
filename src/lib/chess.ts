export const resizeBoard = (variant, newWidth, newHeight) => {
  const { width: currentWidth, height: currentHeight } = variant;

  const createEmptyRow = (width) => Array.from({ length: width }, () => ({ isValid: true, piece: null, color: null }));
  let newBoard = [...variant.board];

  if (newHeight > currentHeight) {
    const topHalf = newBoard.slice(0, Math.ceil(currentHeight / 2));
    const bottomHalf = newBoard.slice(Math.floor(currentHeight / 2));
    const rowsToInsert = newHeight - currentHeight;

    newBoard = [
      ...topHalf,
      ...Array.from({ length: rowsToInsert }, () => createEmptyRow(currentWidth)),
      ...bottomHalf,
    ];
  } else if (newHeight < currentHeight) {
    const rowsToRemove = currentHeight - newHeight;

    newBoard = [
      ...newBoard.slice(0, Math.floor(newBoard.length / 2) - Math.floor(rowsToRemove / 2)),
      ...newBoard.slice(Math.floor(newBoard.length / 2) + Math.ceil(rowsToRemove / 2)),
    ];
  }

  newBoard = newBoard.map((row) => {
    if (newWidth > currentWidth) {
      const leftPadding = Math.floor((newWidth - currentWidth) / 2);
      return [
        ...createEmptyRow(leftPadding),
        ...row,
        ...createEmptyRow(newWidth - currentWidth - leftPadding),
      ];
    } else if (newWidth < currentWidth) {
      const excessWidth = currentWidth - newWidth;
      const startIndex = Math.floor(excessWidth / 2);
      return row.slice(startIndex, startIndex + newWidth);
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
    if (move.type === "slide") {
      for (let r = move.range.from; r <= (move.range.to === Infinity ? radius : move.range.to); r++) {
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

export const decodeSlideOffsets = (offsets) => {
  const orthogonalOffsets = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const diagonalOffsets = [[1, 1], [-1, 1], [-1, -1], [1, -1]];

  const isOrthogonal = offsets.every(offset =>
    orthogonalOffsets.some(([x, y]) => x === offset[0] && y === offset[1])
  );
  const isDiagonal = offsets.every(offset =>
    diagonalOffsets.some(([x, y]) => x === offset[0] && y === offset[1])
  );

  if (isOrthogonal) {
    const canForward = offsets.some(([x, y]) => y > 0);
    const canBackward = offsets.some(([x, y]) => y < 0);
    const canSideways = offsets.some(([x, y]) => x !== 0 && y === 0);
    return { direction: "orthogonal", canForward, canBackward, canSideways };
  }

  if (isDiagonal) {
    const canForward = offsets.some(([x, y]) => y > 0);
    const canBackward = offsets.some(([x, y]) => y < 0);
    return { direction: "diagonal", canForward, canBackward };
  }

  return { direction: "other" };
};

export const encodeSlideOffsets = (param) => {
  let offsets = [];
  if (param.direction === "orthogonal") {
    if (param.canForward) {
      offsets.push([0, 1]);
    }
    if (param.canBackward) {
      offsets.push([0, -1]);
    }
    if (param.canSideways) {
      offsets.push([1, 0], [0, 1]);
    }
  } else if (param.direction === "diagonal") {
    if (param.canForward) {
      offsets.push([1, 1], [1, -1]);
    }
    if (param.canBackward) {
      offsets.push([-1, -1], [1, -1]);
    }
  } else {

  }
  return offsets;
}
