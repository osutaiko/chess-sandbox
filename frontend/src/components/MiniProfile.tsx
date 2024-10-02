import { Chess } from "chess.js";

import { Badge } from "@/components/ui/badge";

import ChessComAvatarFallback from "/src/assets/images/chess-com-avatar-fallback.png";

const MiniProfile = ({ user, ratingChange, fen }) => {
  const chess = new Chess(fen);

  return (
    <div className="flex flex-row gap-3">
      <img
        alt={`Avatar of ${user.username}`}
        src={user.avatarUrl || ChessComAvatarFallback}
        className="h-12 rounded-sm"
      />
      <div className="flex flex-col">
        <div className="flex flex-row gap-2 items-center">
          {user.chessTitle && <Badge className="h-5 p-1 rounded-sm">{user.chessTitle}</Badge>}
          <h3>{user.username}</h3>
          <p>({ratingChange >= 0 ? `+${ratingChange}` : ratingChange} → {user.rating})</p>
        </div>
        <div className="flex flex-row"></div>
      </div>
    </div>
  );
};

export default MiniProfile;