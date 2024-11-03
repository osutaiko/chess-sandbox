import { Variant, PieceMove } from "@/lib/types";

export const resizeBoard = (variant: Variant) => {
  const currentWidth = variant.board[0].length;
  const currentHeight = variant.board.length;

  const newWidth = variant.width;
  const newHeight = variant.height;

  const createEmptyRow = (width: number) => Array.from({ length: width }, () => ({ isValid: true, pieceId: null, color: null }));
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


export const getSquareName = (width: number, height: number, rowIndex: number, colIndex: number) => {
  if (rowIndex < 0 || rowIndex >= height || colIndex < 0 || colIndex >= width) {
    throw new Error("Invalid indices");
  }

  const file = String.fromCharCode(97 + colIndex);  
  const rank = height - rowIndex;
  return `${file}${rank}`;
};

export const getReachableSquares = (moves: PieceMove[], radius: number) => {
  const squares = Array.from({ length: radius * 2 + 1 }, () =>
    Array.from({ length: radius * 2 + 1 }, () => ({
      onInitial: {
        canNonCapture: false,
        canCapture: false,
      },
      onNonInitial: {
        canNonCapture: false,
        canCapture: false,
      },
    }))
  );

  moves.forEach((move) => {
    const { type, canNonCapture, canCapture, isInitialOnly } = move;

    if (type === "slide" || type === "leap") {
      const { offset, range={ from: 1, to: 1 }, canForward, canBackward, canSideways } = move;
      const [a, b] = offset;
      const directions = [];

      if (b === 0) {
        if (canForward) directions.push([b, a]);
        if (canBackward) directions.push([b, -a]);
        if (canSideways) directions.push([a, b], [-a, b]);
      } else {
        if (canForward) directions.push([a, b], [-a, b], [b, a], [-b, a]);
        if (canBackward) directions.push([a, -b], [-a, -b], [b, -a], [-b, -a]);
      }

      directions.forEach(([dx, dy]) => {
        for (let i = range.from; i <= range.to; i++) {
          const x = radius + dx * i;
          const y = radius - dy * i;

          if (x >= 0 && x < squares[0].length && y >= 0 && y < squares.length) {
            squares[y][x] = {
              onInitial: {
                canNonCapture: squares[y][x].onInitial.canNonCapture || canNonCapture,
                canCapture: squares[y][x].onInitial.canCapture || canCapture,
              },
              onNonInitial: {
                canNonCapture: !isInitialOnly ? squares[y][x].onNonInitial.canNonCapture || canNonCapture : squares[y][x].onNonInitial.canNonCapture,
                canCapture: !isInitialOnly ? squares[y][x].onNonInitial.canCapture || canCapture : squares[y][x].onNonInitial.canCapture,
              },
            };
          } else {
            break;
          }
        }
      });
    }
  });
  return squares;
};

export const deletePiece = (variant: Variant, pieceId: string) => {
  const newVariant = {
    ...variant,
    board: variant.board.map(row => 
      row.map(square => ({
        ...square,
        pieceId: square.pieceId === pieceId ? null : square.pieceId,
      }))
    ),
    pieces: variant.pieces.filter(piece => piece.id !== pieceId),
  };

  newVariant.pieces = newVariant.pieces.map(piece => {
    const updatedMoves = piece.moves.map(move => {
      if (move.type === "castle") {
        return { ...move, targetPieces: move.targetPieces.filter(targetId => targetId !== pieceId) };
      } else {
        return move;
      }
    })
    .filter(move => !(move.type === "castle" && move.targetPieces.length === 0));

    return {
      ...piece,
      moves: updatedMoves,
    };
  });

  return newVariant;
};

export const removePieceFromBoard = (variant: Variant, rowIndex: number, colIndex: number) => {
  const updatedVariant = { ...variant };
  if (updatedVariant.board[rowIndex] && updatedVariant.board[rowIndex][colIndex]) {
    updatedVariant.board[rowIndex][colIndex].pieceId = null;
  }
  return updatedVariant;
};

export const addPieceToBoard = (variant: Variant, pieceId: string, color: number, rowIndex: number, colIndex: number) => {
  const updatedVariant = { ...variant };
  if (updatedVariant.board[rowIndex] && updatedVariant.board[rowIndex][colIndex]) {
    updatedVariant.board[rowIndex][colIndex] = {
      ...updatedVariant.board[rowIndex][colIndex],
      pieceId: pieceId,
      color: color
    };
  }
  return updatedVariant;
};
