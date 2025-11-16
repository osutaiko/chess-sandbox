
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
  isFlipped: boolean;
}> = ({ row, col, game, isMyTurn, handlePieceDrop, handleLeftClick, handleRightClick, isValidDestination, isSelected, isFlipped }) => {
  const [, drop] = useDrop({
    accept: "PIECE",
    drop: (item) => handlePieceDrop(item, row, col),
  });

  const square = game.currentBoard[row][col];
  const pieceObj = square.pieceId ? game.pieces.find((p) => p.id === square.pieceId) : null;
  
  const isSquareDark = (row + col) % 2 === 0;

  const rankLabelValue = game.height - row;
  const showRankLabel = isFlipped ? col === 0 : col === game.width - 1;

  const fileLabelValue = String.fromCharCode(97 + col);
  const showFileLabel = isFlipped ? row === 0 : row === game.height - 1;

  const squareBgColor = () => {
    if (isSelected) {
      return "bg-primary";
    }
    if (square.isValid) {
      return isSquareDark ? "bg-square-dark" : "bg-square-light";
    } else {
      return "bg-gray-400";
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
      {showRankLabel && (
        <span className={`absolute top-0.5 right-0.5 text-xs font-semibold ${isSquareDark ? "text-square-light" : "text-square-dark"}`}>
          {rankLabelValue}
        </span>
      )}
      {showFileLabel && (
        <span className={`absolute bottom-0.5 left-0.5 text-xs font-semibold ${isSquareDark ? "text-square-light" : "text-square-dark"}`}>
          {fileLabelValue}
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
  roomId?: string | null;
  isMyTurn: boolean;
  playerIndex: number | null;
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
  };

  return (
    <div
      className="grid md:rounded-md overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${game.width}, 1fr)`,
        gridTemplateRows: `repeat(${game.height}, 1fr)`,
      }}
    >
      {Array.from({ length: game.height }).map((_, rowIndex) => {
        const displayRow = playerIndex === 1 ? game.height - 1 - rowIndex : rowIndex;
        return Array.from({ length: game.width }).map((_, colIndex) => {
          const displayCol = playerIndex === 1 ? game.width - 1 - colIndex : colIndex;
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
              isFlipped={playerIndex === 1}
            />
          );
        });
      })}
    </div>
  );
};

export default PlayChessboard;
