export const DEFAULT_BOARD = Array.from({ length: 8 }, (_, i) => {
  const row = [];
  for (let j = 0; j < 8; j++) {
    const square = `${String.fromCharCode(97 + j)}${8 - i}`;
    let piece = null;
    let color = null;
    if (i === 0) {
      piece = 'rnbqkbnr'[j];
      color = 2;
    } else if (i === 1) {
      piece = 'p';
      color = 2;
    } else if (i === 6) {
      piece = 'p';
      color = 1;
    } else if (i === 7) {
      piece = 'rnbqkbnr'[j];
      color = 1;
    }
    row.push({ square, piece: piece || null, color: color || null });
  }
  return row;
});

export const resizeBoard = (board, newWidth, newHeight) => {
  const currentHeight = board.length;
  const currentWidth = board[0].length;

  let resizedBoard = [...board];

  if (newHeight > currentHeight) {
    for (let i = currentHeight; i < newHeight; i++) {
      const newRow = [];
      for (let j = 0; j < currentWidth; j++) {
        const square = `${String.fromCharCode(97 + j)}${8 - i}`;
        newRow.push({ square, piece: null, color: null });
      }
      resizedBoard.push(newRow);
    }
  } else if (newHeight < currentHeight) {
    resizedBoard = resizedBoard.slice(0, newHeight);
  }

  resizedBoard = resizedBoard.map((row, i) => {
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

  return resizedBoard;
};

export const getSquareName = (width, height, rowIndex, colIndex) => {
  if (rowIndex < 0 || rowIndex >= height || colIndex < 0 || colIndex >= width) {
    throw new Error("Invalid indices");
  }

  const file = String.fromCharCode(97 + colIndex);  
  const rank = height - rowIndex;

  return `${file}${rank}`;
};
