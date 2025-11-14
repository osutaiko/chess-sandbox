
import { useMemo, useState } from "react";
import { useDrop } from "react-dnd";
import { Socket } from "socket.io-client";

import { getLegalMoves, playMove, Game, Move } from "common";

import DraggablePiece from "@/components/DraggablePiece";

import { Circle, X } from "lucide-react";

const Square: React.FC<{
  row: number;
  col: number;
  game: Game;
  isMyTurn: boolean;
  handlePieceDrop: (item: any, row: number, col: number) => void;
  handleLeftClick: (row: number, col: number) => void;
  handleRightClick: (event: React.MouseEvent, row: number, col: number) => void;
  isValidDestination: boolean;
  isSelected: boolean;
  isFlipped: boolean; // Add isFlipped prop
}> = ({ row, col, game, isMyTurn, handlePieceDrop, handleLeftClick, handleRightClick, isValidDestination, isSelected, isFlipped }) => {
  const [, drop] = useDrop({
    accept: "PIECE",
    drop: (item) => handlePieceDrop(item, row, col),
  });

  const square = game.currentBoard[row][col];
  const pieceObj = square.pieceId ? game.pieces.find((p) => p.id === square.pieceId) : null;
  
  const isSquareDark = isFlipped ? (row + col) % 2 === 1 : (game.height - row + col) % 2 === 0;

  const rankLabel = isFlipped
    ? (col === 0 ? row + 1 : null)
    : (col === game.width - 1 ? game.height - row : null);
  const fileLabel = isFlipped
    ? (row === 0 ? String.fromCharCode(97 + (game.width - 1 - col)) : null)
    : (row === game.height - 1 ? String.fromCharCode(97 + col) : null);

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
      className={`relative aspect-square ${squareBgColor()} flex flex-col items-center justify-center`}
      onMouseDown={() => handleLeftClick(row, col)}
      onContextMenu={(event) => handleRightClick(event, row, col)}
    >
      {pieceObj && square.color !== null && (
        <DraggablePiece piece={pieceObj} color={square.color} row={row} col={col} draggable={isMyTurn && game.turn === square.color} />
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
  socket?: Socket | null;
  roomId?: string;
  isMyTurn: boolean;
  playerIndex: number | null; // Add playerIndex prop
}> = ({ game, setGame, socket, roomId, isMyTurn, playerIndex }) => {
  const [selectedSquare, setSelectedSquare] = useState<{ row: number; col: number } | null>(null);
  const [validDestinations, setValidDestinations] = useState<{ row: number; col: number }[]>([]);

  const legalMoves = useMemo(() => getLegalMoves(game), [game, game.history.length]);

  const handleLeftClick = (row: number, col: number) => {
    if (!isMyTurn) return;

    const square = game.currentBoard[row][col];
    
    if (selectedSquare && validDestinations.some(dest => dest.row === row && dest.col === col)) {
      const from = selectedSquare;
      const to = { row, col };
  
      const move = legalMoves.find(
        (m) => m.from.row === from.row && m.from.col === from.col && m.to.row === to.row && m.to.col === col
      );

      if (!move) return;
  
      const newGame = playMove(game, move);
  
      if (setGame) {
        setGame(newGame);
      }
      socket?.emit('chessMove', { roomId, move });
  
      setSelectedSquare(null);
      setValidDestinations([]);
    } 
    else if (square.pieceId && (game.turn === square.color)) {
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
    if (!isMyTurn) return;

    const from = { row: item.row, col: item.col };
    const to = { row, col };
    
    const move = legalMoves.find(
      (m) => m.from.row === from.row && m.from.col === from.col && m.to.row === to.row && m.to.col === to.col
    );

    if (move) {
      const newGame = playMove(game, move);

      if (setGame) {
        setGame(newGame);
      }
      socket?.emit('chessMove', { roomId, move });
    }

    setSelectedSquare(null);
    setValidDestinations([]);
  };

  const handleRightClick = (event: React.MouseEvent, row: number, col: number) => {
    event.preventDefault();
    console.log(event, row, col);
  };

  return (
    <div
      className="grid md:rounded-md overflow-hidden" // Removed rotate-180
      style={{
        gridTemplateColumns: `repeat(${game.width}, 1fr)`,
        gridTemplateRows: `repeat(${game.height}, 1fr)`,
      }}
    >
      {Array.from({ length: game.height }).map((_, rowIndex) => {
        const displayRow = playerIndex === 1 ? game.height - 1 - rowIndex : rowIndex; // Display row for rendering
        return Array.from({ length: game.width }).map((_, colIndex) => {
          const displayCol = playerIndex === 1 ? game.width - 1 - colIndex : colIndex; // Display col for rendering
          return (
            <Square
              key={`${displayRow}-${displayCol}`}
              row={displayRow}
              col={displayCol}
              game={game}
              isMyTurn={isMyTurn}
              handlePieceDrop={handlePieceDrop}
              handleLeftClick={handleLeftClick}
              handleRightClick={handleRightClick}
              isValidDestination={validDestinations.some((dest) => dest.row === displayRow && dest.col === displayCol)}
              isSelected={selectedSquare?.row === displayRow && selectedSquare?.col === displayCol}
              isFlipped={playerIndex === 1} // Pass isFlipped prop
            />
          );
        });
      })}
    </div>
  );
};

export default PlayChessboard;
