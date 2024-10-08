import { Chess } from "chess.js";

import { Badge } from "@/components/ui/badge";

import ChessComAvatarFallback from "/src/assets/images/chess-com-avatar-fallback.png";

const MiniProfile = ({ player, fen }) => {
  const chess = new Chess(fen);

  return (
    <div className="flex flex-row gap-3">
      <img
        alt={`Avatar of ${player.name}`}
        src={player.avatarUrl || ChessComAvatarFallback}
        className="h-12 rounded-sm"
      />
      <div className="flex flex-col">
        <div className="flex flex-row gap-2 items-center">
          {player.title && <Badge className="h-5 p-1 rounded-sm">{player.title}</Badge>}
          <h3>{player.name}</h3>
          <p>({player.ratingChange ? `${player.ratingChange >= 0 ? "+" : ""}${player.ratingChange} → ` : ""}{player.ratingAfter})</p>
        </div>
        <div className="flex flex-row"></div>
      </div>
    </div>
  );
};

export default MiniProfile;