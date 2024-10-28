import { getReachableSquares } from "@/lib/chess";
import { Circle, Play, ArrowRightFromLine } from "lucide-react";

const PieceMovesBoard = ({ isCraftMode, piece, highlightedMoveIndex }) => {
  const radius = 4;
  const width = 2 * radius + 1;
  const height = 2 * radius + 1;
  const reachableSquares = getReachableSquares(
    (isCraftMode && (highlightedMoveIndex !== null)) ? [piece.moves[highlightedMoveIndex]] : piece.moves,
    radius
  );

  const getColor = (canNonCapture, canCapture) => {
    if (canNonCapture && canCapture) return "black";
    else if (canNonCapture) return "green";
    else if (canCapture) return "red";
    return null;
  };

  const renderSquare = (row, col) => {
    const isSquareDark = (row + col) % 2 === 1;
    const square = reachableSquares[row][col];
    const { onInitial, onNonInitial } = square;

    return (
      <div
        key={`${row}-${col}`}
        className={`relative ${
          row === radius && col === radius ? "bg-destructive" : (isSquareDark ? "bg-square-dark" : "bg-square-light")
        } flex flex-col items-center justify-center ${isCraftMode ? "w-[36px]" : "w-[20px]"} aspect-square`}
      >
        {row === radius && col === radius && piece.sprite && (
          <img
            src={`/src/assets/images/pieces/${piece.sprite}-0.svg`}
            className="w-full aspect-square"
            alt="Piece"
          />
        )}
        
        {onInitial.canNonCapture === onNonInitial.canNonCapture && onInitial.canCapture === onNonInitial.canCapture ? (
          (() => {
            const color = getColor(onInitial.canNonCapture, onInitial.canCapture);
            return color ? <Circle stroke={color} strokeWidth={2} className="w-1/2 h-1/2" /> : null;
          })()
        ) : (
          <div className="flex flex-row w-full h-full justify-center items-center">
            {onInitial && (onInitial.canCapture || onInitial.canNonCapture) && (
              <Play
                stroke={getColor(onInitial.canNonCapture, onInitial.canCapture)}
                strokeWidth={2}
                className={`${onNonInitial && (onNonInitial.canCapture || onNonInitial.canNonCapture) ? "w-full h-full" : "w-3/5 h-3/5"}`}
              />
            )}
            {onNonInitial && (onNonInitial.canCapture || onNonInitial.canNonCapture) && (
              <ArrowRightFromLine
                stroke={getColor(onNonInitial.canNonCapture, onNonInitial.canCapture)}
                strokeWidth={2}
                className={`${onInitial && (onInitial.canCapture || onInitial.canNonCapture) ? "w-full h-full" : "w-3/5 h-3/5"}`}
              />
            )}
          </div>
        )}
        {(isCraftMode && (highlightedMoveIndex !== null)) && <div className="absolute inset-0 bg-white opacity-20" />}
      </div>
    );
  };

  return (
    <div
      className="grid rounded-sm overflow-hidden w-min"
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

export default PieceMovesBoard;