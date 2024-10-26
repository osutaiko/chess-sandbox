import { useDrop } from "react-dnd";

import { addPieceToBoard, removePieceFromBoard } from "@/lib/chess";
import DraggablePiece from "@/components/DraggablePiece";

const Chessboard = ({ variant, setVariant, selectedPieceId, selectedPieceColor }) => {
  const handlePieceDrop = (item, row, col) => {
    const isWithinBounds =
      row >= 0 && row < variant.height && col >= 0 && col < variant.width;
    if (!isWithinBounds || !variant.board[row][col].isValid) {
      // Remove piece if dropped outside bounds or on invalid square
      const variantWithoutPiece = removePieceFromBoard(variant, item.row, item.col);
      setVariant(variantWithoutPiece);
    } else {
      // Move piece within bounds
      const variantWithoutPiece = removePieceFromBoard(variant, item.row, item.col);
      const updatedVariant = addPieceToBoard(variantWithoutPiece, item.id, item.color, row, col);
      setVariant(updatedVariant);
    }
  };

  const handleLeftClick = (row, col) => {
    if (selectedPieceId) {
      const updatedVariant = addPieceToBoard(variant, selectedPieceId, selectedPieceColor, row, col);
      setVariant(updatedVariant);
    }
  };

  const handleRightClick = (event, row, col) => {
    event.preventDefault();
    if (variant.board[row][col].piece) {
      const updatedVariant = removePieceFromBoard(variant, row, col);
      setVariant(updatedVariant);
    }
  };

  const renderSquare = (row, col) => {
    const [, drop] = useDrop({
      accept: "PIECE",
      drop: (item) => handlePieceDrop(item, row, col),
    });

    const isSquareDark = (variant.height - row + col) % 2 === 0;
    const pieceObj = variant.board[row][col].piece ? 
      variant.pieces.find(p => p.id === variant.board[row][col].piece) : null;

    const rankLabel = col === variant.width - 1 ? variant.height - row : null;
    const fileLabel = row === variant.height - 1 ? String.fromCharCode(97 + col) : null;

    return (
      <div
        ref={drop}
        key={`${row}-${col}`}
        className={`relative aspect-square ${variant.board[row][col].isValid ? (isSquareDark ? "bg-square-dark" : "bg-square-light") : "bg-secondary"} flex flex-col items-center justify-center`}
        onClick={() => handleLeftClick(row, col)}
        onContextMenu={(event) => handleRightClick(event, row, col)}
      >
        {pieceObj && (
          <DraggablePiece piece={pieceObj} color={variant.board[row][col].color} row={row} col={col} />
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
