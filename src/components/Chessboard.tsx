const Chessboard = ({ variant }) => {
  const renderSquare = (row, col) => {
    const isSquareDark = (variant.height - row + col) % 2 === 0;
    const pieceObj = variant.board[row][col].piece ? 
      variant.pieces.find(p => p.id === variant.board[row][col].piece) : null;

    const rankLabel = col === variant.width - 1 ? variant.height - row : null;
    const fileLabel = row === variant.height - 1 ? String.fromCharCode(97 + col) : null;

    return (
      <div
        key={`${row}-${col}`}
        className={`relative aspect-square ${variant.board[row][col].isValid ? (isSquareDark ? "bg-square-dark" : "bg-square-light") : "bg-secondary"} flex flex-col items-center justify-center`}
      >
        {pieceObj && (
          <img
            src={`/src/assets/images/pieces/${pieceObj.sprite}-${variant.board[row][col].color}.svg`}
            className="aspect-square w-full h-full"
            alt={pieceObj.id}
          />
        )}
        {rankLabel && (
          <span className="absolute top-0.5 right-1 text-xs font-semibold text-muted">
            {rankLabel}
          </span>
        )}
        {fileLabel && (
          <span className="absolute bottom-0 left-1 text-xs font-semibold text-muted">
            {fileLabel}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className="grid rounded-md overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${variant.width}, 1fr)`,
        gridTemplateRows: `repeat(${variant.height}, 1fr)`,
      }}
    >
      {Array.from({ length: variant.height }).map((_, row) =>
        Array.from({ length: variant.width }).map((_, col) => renderSquare(row, col))
      )}
    </div>
  );
};

export default Chessboard;
