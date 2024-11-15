import { Variant, PieceMove, Game, Move } from "@/lib/types";

export const resizeBoard = (variant: Variant) => {
  const currentWidth = variant.initialBoard[0].length;
  const currentHeight = variant.initialBoard.length;

  const newWidth = variant.width;
  const newHeight = variant.height;

  const createEmptyRow = (width: number) => Array.from({ length: width }, () => ({ isValid: true, pieceId: null, color: null }));
  let newBoard = [...variant.initialBoard];

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

  return { ...variant, width: newWidth, height: newHeight, initialBoard: newBoard };
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
    initialBoard: variant.initialBoard.map(row => 
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
  if (updatedVariant.initialBoard[rowIndex] && updatedVariant.initialBoard[rowIndex][colIndex]) {
    updatedVariant.initialBoard[rowIndex][colIndex].pieceId = null;
  }
  return updatedVariant;
};

export const addPieceToBoard = (variant: Variant, pieceId: string, color: number, rowIndex: number, colIndex: number) => {
  const updatedVariant = { ...variant };
  if (updatedVariant.initialBoard[rowIndex] && updatedVariant.initialBoard[rowIndex][colIndex]) {
    updatedVariant.initialBoard[rowIndex][colIndex] = {
      ...updatedVariant.initialBoard[rowIndex][colIndex],
      pieceId: pieceId,
      color: color
    };
  }
  return updatedVariant;
};

const isInitialMove = (game: Game, row: number, col: number): boolean => {
  if (!game.currentBoard[row][col].pieceId) {
    return false;
  }
  if (game.initialBoard[row][col].pieceId !== game.currentBoard[row][col].pieceId) {
    return false;
  }
  return !game.history.some((move) => move.from.row === row && move.from.col === col);
};

/* const remainingRoyalCount = (game: Game, color: number) => {
  let count = 0;

  for (let row = 0; row < game.height; row++) {
    for (let col = 0; col < game.width; col++) {
      const square = game.currentBoard[row][col];

      if (square.pieceId && square.color === color && game.royals.includes(square.pieceId)) {
        count++;
      }
    }
  }

  return count;
} */

/* const isAttacked = (game: Game, row: number, col: number) => {
  
} */

export const getLegalMoves = (game: Game): Move[] => {
  const legalMoves: Move[] = [];

  for (let row = 0; row < game.height; row++) {
    for (let col = 0; col < game.width; col++) {
      const square = game.currentBoard[row][col];
      const pieceObj = square.pieceId ? game.pieces.find((p) => p.id === square.pieceId) : null;
      
      if (!pieceObj || (game.history.length % game.playerCount !== square.color)) {
        continue;
      }

      const colorAdjustedDy = square.color === 0 ? 1 : -1;

      pieceObj.moves.forEach((move) => {
        if (move.isInitialOnly && !isInitialMove(game, row, col)) {
          return;
        }

        if (move.type === "slide") {
          const ofs0 = move.offset[0] * colorAdjustedDy;
          const ofs1 = move.offset[1];

          const trySlideInDirection = (colOffset: number, rowOffset: number) => {
            let steps = 1;

            while (steps <= move.range.to) {
              const newRow = row - rowOffset * steps;
              const newCol = col + colOffset * steps;

              if (newRow < 0 || newRow >= game.height || newCol < 0 || newCol >= game.width) {
                break;
              }

              const destinationSquare = game.currentBoard[newRow][newCol];

              if (steps >= move.range.from) {
                if (
                  (move.canNonCapture && !destinationSquare.pieceId) ||
                  (move.canCapture && destinationSquare.pieceId && square.color !== destinationSquare.color)
                ) {
                  const moveToAdd = { from: { row, col }, to: { row: newRow, col: newCol } };
                  
                  const moveExists = legalMoves.some(existingMove =>
                    JSON.stringify(existingMove) === JSON.stringify(moveToAdd)
                  );

                  if (!moveExists) {
                    legalMoves.push(moveToAdd);
                  }
                }
              }

              if (destinationSquare.pieceId) {
                break;
              }

              steps++;
            }
          };

          if (ofs1 === 0) {
            if (move.canForward) {
              trySlideInDirection(ofs1, ofs0);
            }
            if (move.canBackward) {
              trySlideInDirection(ofs1, -ofs0);
            }
            if (move.canSideways) {
              trySlideInDirection(ofs0, ofs1);
              trySlideInDirection(-ofs0, ofs1);
            }
          } else {
            if (move.canForward) {
              trySlideInDirection(ofs0, ofs1);
              trySlideInDirection(-ofs0, ofs1);
              trySlideInDirection(ofs1, ofs0);
              trySlideInDirection(-ofs1, ofs0);
            }
            if (move.canBackward) {
              trySlideInDirection(ofs0, -ofs1);
              trySlideInDirection(-ofs0, -ofs1);
              trySlideInDirection(ofs1, -ofs0);
              trySlideInDirection(-ofs1, -ofs0);
            }
          }
        } else if (move.type === "leap") {
          const ofs0 = move.offset[0] * colorAdjustedDy;
          const ofs1 = move.offset[1];

          const tryLeap = (colOffset: number, rowOffset: number) => {
            const newRow = row - rowOffset;
            const newCol = col + colOffset;

            if (
              newRow >= 0 && newRow < game.height &&
              newCol >= 0 && newCol < game.width
            ) {
              const destinationSquare = game.currentBoard[newRow][newCol];

              if (
                (move.canNonCapture && !destinationSquare.pieceId) ||
                (move.canCapture && destinationSquare.pieceId && square.color !== destinationSquare.color)
              ) {
                const moveToAdd = { from: { row, col }, to: { row: newRow, col: newCol } };

                const moveExists = legalMoves.some(existingMove =>
                  JSON.stringify(existingMove) === JSON.stringify(moveToAdd)
                );

                if (!moveExists) {
                  legalMoves.push(moveToAdd);
                }
              }
            }
          };

          if (ofs1 === 0) {
            if (move.canForward) {
              tryLeap(ofs1, ofs0);
            }
            if (move.canBackward) {
              tryLeap(ofs1, -ofs0);
            }
            if (move.canSideways) {
              tryLeap(ofs0, ofs1);
              tryLeap(-ofs0, ofs1);
            }
          } else {
            if (move.canForward) {
              tryLeap(ofs0, ofs1);
              tryLeap(-ofs0, ofs1);
              tryLeap(ofs1, ofs0);
              tryLeap(-ofs1, ofs0);
            }
            if (move.canBackward) {
              tryLeap(ofs0, -ofs1);
              tryLeap(-ofs0, -ofs1);
              tryLeap(ofs1, -ofs0);
              tryLeap(-ofs1, -ofs0);
            }
          }
        }
      });
    }
  }
  
  return legalMoves;
};

export const playMove = (game: Game, move: Move) => {
  const { from, to } = move;
  const pieceId = game.currentBoard[from.row][from.col].pieceId;
  const color = game.currentBoard[from.row][from.col].color;

  if (!pieceId) {
    return;
  }

  const legalMoves = getLegalMoves(game);
  const isLegalMove = legalMoves.some(
    (move) => move.to.row === to.row && move.to.col === to.col
  );

  if (!isLegalMove) {
    return;
  }

  game.currentBoard[to.row][to.col] = {
    ...game.currentBoard[to.row][to.col],
    pieceId: pieceId,
    color: color,
  };

  game.currentBoard[from.row][from.col] = {
    ...game.currentBoard[from.row][from.col],
    pieceId: null,
    color: null,
  };

  game.history.push(move);
};
