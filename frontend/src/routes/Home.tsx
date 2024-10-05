import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Home = () => {
  const defaultUsername = "MagnusCarlsen";
  const defaultGameLink = "https://www.chess.com/game/live/6347929590?username=turbofisto";
  const [username, setUsername] = useState("");
  const [gameLink, setGameLink] = useState("");

  const onUsernameSubmit = () => {
    window.location.href = `/user/${username || defaultUsername}`;
  };

  const onGameLinkSubmit = () => {
    const encodedLink = encodeURIComponent(gameLink || defaultGameLink);
    window.location.href = `/game/?url=${encodedLink}`;
  };

  return (
    <div className="flex flex-col gap-16 self-center items-center w-full h-full">
      <div className="flex flex-col gap-6">
        <h1 className="text-center">Pawnpulse</h1>
        <p className="text-center">Discover your unique chess playstyle in a single click</p>
      </div>
      <div className="flex flex-col gap-6 w-1/2">
        <div className="flex flex-col gap-2">
          <h3>Enter your Chess.com username:</h3>
          <div className="flex flex-row gap-2">
            <Input
              placeholder={defaultUsername}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onUsernameSubmit();
                }
              }}
            />
            <Button onClick={onUsernameSubmit}>Go</Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3>... or a game link for review:</h3>
          <div className="flex flex-row gap-2">
            <Input
              placeholder={defaultGameLink}
              value={gameLink}
              onChange={(e) => setGameLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onGameLinkSubmit();
                }
              }}
            />
            <Button onClick={onGameLinkSubmit}>Go</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;