const Chessboard = ({ variant }) => {
  const width = variant.board[0].length;
  const height = variant.board.length;

  const renderSquare = (row, col) => {
    const isSquareDark = (height - row + col) % 2 === 1;
    const isValidSquare = variant.board[row][col].square ? true : false;
    const pieceColor = variant.board[row][col].color;
    const pieceObj = variant.board[row][col].piece ? variant.pieces.find(p => p.id === variant.board[row][col].piece) : null;

    const rankLabel = col === width - 1 ? height - row : null;
    const fileLabel = row === height - 1 ? String.fromCharCode(97 + col) : null;

    return (
      <div
        key={variant.board[row][col].square}
        className={`relative aspect-square ${isValidSquare ? (isSquareDark ? "bg-square-dark" : "bg-square-light") : ""} flex flex-col items-center justify-center`}
      >
        {pieceObj && (
          <img
            src={`/src/assets/images/pieces/${pieceObj.sprite}-${pieceColor}.svg`}
            className="w-full h-full aspect-square"
          />
        )}
        {rankLabel && (
          <span className={`absolute top-0.5 right-1 font-bold text-xs ${isSquareDark ? "text-square-light" : "text-square-dark"}`}>
            {rankLabel}
          </span>
        )}
        {fileLabel && (
          <span className={`absolute bottom-0 left-1 font-bold text-xs ${isSquareDark ? "text-square-light" : "text-square-dark"}`}>
            {fileLabel}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className="grid rounded-md"
      style={{
        gridTemplateColumns: `repeat(${width}, 1fr)`,
        gridTemplateRows: `repeat(${height}, 1fr)`,
      }}
    >
      {Array.from({ length: height }).map((_, row) =>
        Array.from({ length: width }).map((_, col) => renderSquare(row, col))
      )}
    </div>
  );
};

export default Chessboard;
