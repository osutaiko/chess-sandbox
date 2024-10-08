import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const Home = () => {
  const defaultUsername = "MagnusCarlsen";
  const defaultGameLink = "https://www.chess.com/game/live/120951058309";
  const defaultPgn = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.09.24"]
[Round "?"]
[White "zimmm36"]
[Black "Hikaru"]
[Result "0-1"]
[TimeControl "180+1"]
[WhiteElo "2668"]
[BlackElo "3269"]
[Termination "Hikaru won by resignation"]
[ECO "A00"]
[EndTime "21:17:33 GMT+0000"]
[Link "https://www.chess.com/game/live/120951058309"]

1. g4 d5 2. h3 h5 3. g5 e5 4. d3 Ne7 5. Bg2 Ng6 6. e4 Nh4 7. Bf3 Be7 8. exd5 Bxg5 9. Nd2 g6 10. Ne4 Bxc1 11. Rxc1 f5 12. Nd2 Nd7 13. c4 O-O 14. Ne2 Nc5 15. Rc3 e4 16. dxe4 fxe4 17. Bxe4 Qf6 18. Rf1 Bf5 19. Qc2 Rae8 20. Ng3 Nxe4 21. Ndxe4 Bxe4 22. Nxe4 Nf3+ 23. Kd1 Qe5 24. Re3 Nd4 25. Qd3 Nf5 26. Re2 Qf4 27. Rfe1 Re7 28. Ng3 Rxe2 29. Rxe2 Qg5 30. Nxf5 Rxf5 31. Qe3 Qxe3 32. Rxe3 Rxf2 33. Re7 Rf7 34. Rxf7 Kxf7 35. h4 Kf6 36. Kd2 g5 37. hxg5+ Kxg5 38. Ke3 Kf5 39. b4 Ke5 40. a4 h4 0-1`;

  const [username, setUsername] = useState("");
  const [gameLink, setGameLink] = useState("");
  const [pgn, setPgn] = useState("");

  const onUsernameSubmit = () => {
    window.location.href = `/user/${username || defaultUsername}`;
  };

  const onGameLinkSubmit = () => {
    const encodedLink = encodeURIComponent(gameLink || defaultGameLink);
    window.location.href = `/game/?url=${encodedLink}`;
  };

  const onPgnSubmit = () => {
    const encodedPgn = encodeURIComponent(pgn || defaultPgn);
    window.location.href = `/game/?pgn=${encodedPgn}`;
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
          <div className="flex flex-row gap-1">
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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Import PGN</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import PGN</DialogTitle>
                  <DialogDescription hidden>
                    Import PGN dialog
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder={defaultPgn}
                  value={pgn}
                  onChange={(e) => setPgn(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onPgnSubmit();
                    }
                  }}
                  className="h-[400px]"
                />
                <DialogFooter>
                  <Button onClick={onPgnSubmit}>Go</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={onGameLinkSubmit}>Go</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;