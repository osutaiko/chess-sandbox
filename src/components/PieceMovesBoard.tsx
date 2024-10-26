import { getReachableSquares } from "@/lib/chess";

import { Circle, Play } from "lucide-react";

const PieceMovesBoard = ({ isCraftMode, piece }) => {
  const radius = 4;
  const width = 2 * radius + 1;
  const height = 2 * radius + 1;
  const reachableSquares = getReachableSquares(piece.moves, radius);

  const renderSquare = (row, col) => {
    const isSquareDark = (row + col) % 2 === 1;
    const square = reachableSquares[row][col];

    let markerColor = "transparent";
    let showMarker = false;
    if (square.canMove && square.canCapture) {
      markerColor = "black";
      showMarker = true;
    } else if (square.canMove) {
      markerColor = "green";
      showMarker = true;
    } else if (square.canCapture) {
      markerColor = "red";
      showMarker = true;
    }

    return (
      <div
        key={`${row}-${col}`}
        className={`relative ${row === radius && col === radius ? "bg-destructive" :  (isSquareDark ? "bg-square-dark" : "bg-square-light")} flex flex-col items-center justify-center ${isCraftMode ? "w-[48px]" : "w-[20px]"} aspect-square`}
      >
        {row === radius && col === radius && piece.sprite && (
          <img
            src={`/src/assets/images/pieces/${piece.sprite}-0.svg`}
            className="w-full aspect-square"
          />
        )}
        {showMarker && (
          square.onlyOnInitial ? 
          <Play stroke={markerColor} className="w-3/5 h-3/5" /> :
          <Circle stroke={markerColor} className="w-1/2 h-1/2" />
        )}
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
