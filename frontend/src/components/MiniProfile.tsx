import ChessComAvatarFallback from "/src/assets/images/chess-com-avatar-fallback.png";

import { Badge } from "@/components/ui/badge";

const MiniProfile = ({ user, color }) => {
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
          <h4>{user.username}</h4>
          <p>({user.rating})</p>
        </div>
      </div>
    </div>
  );
};

export default MiniProfile;