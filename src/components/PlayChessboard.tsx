
import { useMemo, useState } from "react";
import { useDrop } from "react-dnd";

import { getLegalMoves, playMove } from "@/lib/chess";
import { Game, Move } from "@/lib/types";

import DraggablePiece from "@/components/DraggablePiece";

import { Circle, X } from "lucide-react";

const Square: React.FC<{
  row: number;
  col: number;
  game: Game;
  handlePieceDrop: (item: any, row: number, col: number) => void;
  handleLeftClick: (row: number, col: number) => void;
  handleRightClick: (event: any, row: number, col: number) => void;
  isValidDestination: boolean;
  isSelected: boolean;
}> = ({ row, col, game, handlePieceDrop, handleLeftClick, handleRightClick, isValidDestination, isSelected }) => {
  const [, drop] = useDrop({
    accept: "PIECE",
    drop: (item) => handlePieceDrop(item, row, col),
  });

  const square = game.currentBoard[row][col];
  const pieceObj = square.pieceId ? game.pieces.find((p) => p.id === square.pieceId) : null;
  const isSquareDark = (game.height - row + col) % 2 === 0;

  const rankLabel = col === game.width - 1 ? game.height - row : null;
  const fileLabel = row === game.height - 1 ? String.fromCharCode(97 + col) : null;

  const squareBgColor = () => {
    if (square.isValid) {
      if (isSelected) {
        return "bg-primary";
      }
      if (isSquareDark) {
        return "bg-square-dark";
      } else {
        return "bg-square-light";
      }
    } else {
      return "bg-secondary";
    }
  }

  return (
    <div
      ref={drop}
      className={`relative md:max-w-full aspect-square ${squareBgColor()} flex flex-col items-center justify-center`}
      onMouseDown={() => handleLeftClick(row, col)}
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
      {isValidDestination && (
        square.pieceId ? <X fill="gray" stroke="gray" strokeWidth={8} opacity={0.8} className="absolute w-1/2 h-1/2 z-50" /> :
        <Circle fill="gray" stroke="gray" opacity={0.7} className="absolute w-1/3 h-1/3 z-50" />
      )}
    </div>
  );
};

const PlayChessboard: React.FC<{
  game: Game;
  setGame?: (game: Game) => void;
  selectedPieceId?: string | null;
}> = ({ game, setGame }) => {
  const [selectedSquare, setSelectedSquare] = useState<{ row: number; col: number } | null>(null);
  const [validDestinations, setValidDestinations] = useState<{ row: number; col: number }[]>([]);

  const legalMoves = useMemo(() => getLegalMoves(game), [game, game.history.length]);

  const handleLeftClick = (row: number, col: number) => {
    const square = game.currentBoard[row][col];
    
    if (selectedSquare && validDestinations.some(dest => dest.row === row && dest.col === col)) {
      const from = selectedSquare;
      const to = { row, col };
  
      playMove(game, { from, to });
  
      if (setGame) {
        setGame({ ...game });
      }
  
      setSelectedSquare(null);
      setValidDestinations([]);
    } 
    else if (square.pieceId && (game.history.length % game.playerCount === square.color)) {
      setSelectedSquare({ row, col });
      setValidDestinations(
        legalMoves
          .filter((move: Move) => move.from.row === row && move.from.col === col)
          .map((move: Move) => move.to)
      );
    } else {
      setSelectedSquare(null);
      setValidDestinations([]);
    }
  };

  const handlePieceDrop = (item: any, row: number, col: number) => {
    const from = { row: item.row, col: item.col };
    const to = { row, col };
    
    const isLegalMove = legalMoves.some(
      (move) => move.from.row === from.row && move.from.col === from.col && move.to.row === to.row && move.to.col === to.col
    );

    if (isLegalMove) {
      playMove(game, { from, to });

      if (setGame) {
        setGame({ ...game });
      }
    }

    setSelectedSquare(null);
    setValidDestinations([]);
  };

  const handleRightClick = (event: any, row: number, col: number) => {
    console.log(event, row, col);
  };

  return (
    <div
      className="grid md:rounded-md overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${game.width}, 1fr)`,
        gridTemplateRows: `repeat(${game.height}, 1fr)`,
      }}
    >
      {Array.from({ length: game.height }).map((_, row) =>
        Array.from({ length: game.width }).map((_, col) => (
          <Square
            key={`${row}-${col}`}
            row={row}
            col={col}
            game={game}
            handlePieceDrop={handlePieceDrop}
            handleLeftClick={handleLeftClick}
            handleRightClick={handleRightClick}
            isValidDestination={validDestinations.some((dest) => dest.row === row && dest.col === col)}
            isSelected={selectedSquare?.row === row && selectedSquare?.col === col}
          />
        ))
      )}
    </div>
  );
};

export default PlayChessboard;
