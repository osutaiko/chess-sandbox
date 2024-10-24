import { getReachableSquares } from "@/lib/chess";

import { Circle, Play } from "lucide-react";

const PieceMovementsBoard = ({ piece }) => {
  const radius = 3;
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
        className={`relative ${
          isSquareDark ? "bg-square-dark" : "bg-square-light"
        } flex flex-col items-center justify-center w-[25px] aspect-square`}
      >
        {row === radius && col === radius && (
          <img
            src={`/src/assets/images/pieces/${piece.sprite}-0.svg`}
            className="w-full aspect-square"
          />
        )}
        {showMarker && (
          square.onlyOnInitial ? 
          <Play stroke={markerColor} size={16} /> :
          <Circle stroke={markerColor} size={16} />
        )}
      </div>
    );
  };

  return (
    <div
      className="grid rounded-sm overflow-hidden"
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

export default PieceMovementsBoard;
