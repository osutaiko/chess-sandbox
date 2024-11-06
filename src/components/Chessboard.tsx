import { useDrop } from "react-dnd";

import { addPieceToBoard, removePieceFromBoard } from "@/lib/chess";
import DraggablePiece from "@/components/DraggablePiece";
import { Variant } from "@/lib/types";

const Square: React.FC<{
  row: number;
  col: number;
  variant: Variant;
  handlePieceDrop: (item: any, row: number, col: number) => void;
  handleLeftClick: (row: number, col: number) => void;
  handleRightClick: (event: any, row: number, col: number) => void;
}> = ({ row, col, variant, handlePieceDrop, handleLeftClick, handleRightClick }) => {
  const [, drop] = useDrop({
    accept: "PIECE",
    drop: (item) => handlePieceDrop(item, row, col),
  });

  const isSquareDark = (variant.height - row + col) % 2 === 0;
  const square = variant.board[row][col];
  const pieceObj = square.pieceId ? variant.pieces.find(p => p.id === square.pieceId) : null;

  const rankLabel = col === variant.width - 1 ? variant.height - row : null;
  const fileLabel = row === variant.height - 1 ? String.fromCharCode(97 + col) : null;

  return (
    <div
      ref={drop}
      className={`relative md:max-w-full aspect-square ${square.isValid ? (isSquareDark ? "bg-square-dark" : "bg-square-light") : "bg-secondary"} flex flex-col items-center justify-center`}
      onClick={() => handleLeftClick(row, col)}
      onContextMenu={(event) => handleRightClick(event, row, col)}
    >
      {pieceObj && square.color !== null && (
        <DraggablePiece piece={pieceObj} color={square.color} row={row} col={col} />
      )}
      {rankLabel && (
        <span className={`absolute top-0.5 right-1 text-xs font-semibold ${square.isValid ? (isSquareDark ? "text-square-light" : "text-square-dark") : "text-muted-foreground"}`}>
          {rankLabel}
        </span>
      )}
      {fileLabel && (
        <span className={`absolute bottom-0 left-1 text-xs font-semibold ${square.isValid ? (isSquareDark ? "text-square-light" : "text-square-dark") : "text-muted-foreground"}`}>
          {fileLabel}
        </span>
      )}
    </div>
  );
};

const Chessboard: React.FC<{
  variant: Variant;
  isInteractable: boolean;
  setVariant?: (variant: Variant) => void;
  selectedPieceId?: string | null;
  selectedPieceColor?: number | null;
}> = ({ variant, isInteractable, setVariant, selectedPieceId, selectedPieceColor }) => {
  const handlePieceDrop = (item: any, row: number, col: number) => {
    if (!isInteractable || !setVariant) {
      return;
    }

    const variantWithoutPiece = removePieceFromBoard(variant, item.row, item.col);
    if (row === null || col === null || !variant.board[row]?.[col]?.isValid) {
      setVariant(variantWithoutPiece);
    } else {
      const updatedVariant = addPieceToBoard(variantWithoutPiece, item.id, item.color, row, col);
      setVariant(updatedVariant);
    }
  };

  const handleLeftClick = (row: number, col: number) => {
    if (!isInteractable || !setVariant || !selectedPieceColor) {
      return;
    }

    if (selectedPieceId && selectedPieceColor !== null) {
      const updatedVariant = addPieceToBoard(variant, selectedPieceId, selectedPieceColor, row, col);
      setVariant(updatedVariant);
    }
  };

  const handleRightClick = (event: any, row: number, col: number) => {
    if (!isInteractable || !setVariant) {
      return;
    }
    
    event.preventDefault();
    if (variant.board[row][col].pieceId) {
      const updatedVariant = removePieceFromBoard(variant, row, col);
      setVariant(updatedVariant);
    }
  };

  return (
    <div
      className="grid md:rounded-md overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${variant.width}, 1fr)`,
        gridTemplateRows: `repeat(${variant.height}, 1fr)`,
      }}
    >
      {Array.from({ length: variant.height }).map((_, row) =>
        Array.from({ length: variant.width }).map((_, col) => (
          <Square 
            key={`${row}-${col}`} 
            row={row} 
            col={col} 
            variant={variant} 
            handlePieceDrop={handlePieceDrop}
            handleLeftClick={handleLeftClick} 
            handleRightClick={handleRightClick} 
          />
        ))
      )}
    </div>
  );
};

export default Chessboard;
