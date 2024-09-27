import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Home = () => {
  const defaultUsername = "MagnusCarlsen";
  const defaultGameLink = "https://www.chess.com/game/live/121025418733?username=hikaru";
  const [username, setUsername] = useState("");
  const [gameLink, setGameLink] = useState("");

  const extractGameIdFromLink = (link: string) => {
    const regex = /chess\.com\/game\/(live|daily)\/(\d+)/;
    const match = link.match(regex);
    if (match) {
      return {
        // live or daily
        type: match[1],
        id: match[2],
      };
    }
    return null;
  };

  const onUsernameSubmit = () => {
    if (username) {
      window.location.href = `/user/${username}`;
    } else {
      window.location.href = `/user/${defaultUsername}`;
    }
  };

  const onGameLinkSubmit = () => {
    const gameInfo = extractGameIdFromLink(gameLink || defaultGameLink);
    if (gameInfo) {
      window.location.href = `/game/${gameInfo.type}/${gameInfo.id}`;
    } else {
      alert("Please enter a valid Chess.com game link.");
    }
  };

  return (
    <div className="flex flex-grow flex-col gap-16 items-center justify-center w-full h-full">
      <div className="flex flex-col gap-6">
        <h1 className="text-center">Pawnpulse</h1>
        <p className="text-center">Discover your unique chess playstyle in a single click</p>
      </div>
      <div className="flex flex-col gap-6 w-1/2">
        <div className="flex flex-col gap-2">
          <h3>Enter your Chess.com username:</h3>
          <div className="flex flex-row gap-1">
            <Input
              placeholder={defaultUsername}
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
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
          <div className="flex flex-row gap-1">
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