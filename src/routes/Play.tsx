import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Game } from "@/lib/types";

import PlayChessboard from "@/components/PlayChessboard";

const Play = () => {
  const location = useLocation();
  const variant = location.state?.variant;
  const [game, setGame] = useState<Game>({ ...structuredClone(variant), currentBoard: structuredClone(variant.initialBoard), history: [] });

  return (
    <div className="w-1/2">
      <PlayChessboard game={game} setGame={setGame} />
    </div>
  );
};

export default Play;