import { Chess } from "chess.js";

import { Badge } from "@/components/ui/badge";

import { CircleGauge } from "lucide-react";

import ChessComAvatarFallback from "/src/assets/images/chess-com-avatar-fallback.png";

const MiniProfile = ({ player, color, fen }) => {
  const chess = new Chess(fen);

  const pieceValues = {
    p: 1,   // Pawn
    n: 3,   // Knight
    b: 3,   // Bishop
    r: 5,   // Rook
    q: 9    // Queen
  };

  const getMaterialDifference = (board) => {
    let whiteMaterial = 0;
    let blackMaterial = 0;
  
    for (const row of board) {
      for (const piece of row) {
        if (piece) {
          if (piece.color === 'w') {
            whiteMaterial += pieceValues[piece.type] || 0;
          } else if (piece.color === 'b') {
            blackMaterial += pieceValues[piece.type] || 0;
          }
        }
      }
    }
  
    return (color === "white") ? whiteMaterial - blackMaterial : blackMaterial - whiteMaterial;
  };

  const materialDifference = getMaterialDifference(chess.board());

  return (
    <div className="flex flex-row gap-3">
      <img
        alt={`Avatar of ${player.name}`}
        src={player.avatarUrl || ChessComAvatarFallback}
        className="h-12 rounded-sm"
      />
      <div className="flex flex-col justify-between">
        <div className="flex flex-row gap-2 items-center">
          {player.title && <Badge className="h-5 p-1 rounded-sm">{player.title}</Badge>}
          <h3>{player.name}</h3>
          <p>({player.ratingChange ? `${player.ratingChange >= 0 ? "+" : ""}${player.ratingChange} → ` : ""}{player.ratingAfter})</p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <CircleGauge size={18} />
          <p className={materialDifference > 0 ? "text-green-600" :
            materialDifference < 0 ? "text-red-600" : ""}
          >
            {`${materialDifference > 0 ? "+" : ""}${materialDifference}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MiniProfile;