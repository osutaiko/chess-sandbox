import { useEffect, useState, useRef } from "react";

import { Chess } from "chess.js";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { formatEval } from "@/lib/utils";

const AnalysisInterface = ({ fen, currentPly }) => {
  const [minDepth, setMinDepth] = useState(8);
  const [maxDepth, setMaxDepth] = useState(20);
  const [multiPV, setMultiPV] = useState(3);
  const [engineResults, setEngineResults] = useState([]);
  const [currentDepth, setCurrentDepth] = useState(0);

  const chess = new Chess(fen);

  useEffect(() => {
    setEngineResults([]);
    setCurrentDepth(minDepth);
    const engineWorker = new Worker("/stockfish-16.1-lite-single.js");
    
    engineWorker.onmessage = (event) => {
      const message = event.data;
  
      if (message.startsWith("info") && message.includes("score")) {
        const regex = /depth (\d+) seldepth \d+ multipv (\d+) score (?:cp (-?\d+)|mate (-?\d+)) nodes \d+ nps \d+ hashfull \d+ time \d+ pv (.+)/;
        const match = message.match(regex);
  
        if (match) {
          const tempChess = new Chess(chess.fen());

          const depth = parseInt(match[1]);
          const multipv = parseInt(match[2]);
          const scoreCp = match[3] ? parseInt(chess.turn() === "w" ? match[3] : -match[3]) : null;
          const scoreMate = match[4] ? parseInt(chess.turn() === "w" ? match[4] : -match[4]) : null;
          const continuation = match[5].split(" ").map((move) => tempChess.move(move).san);
          
          if (depth >= minDepth) {
            setEngineResults((prev) => {
              const updatedResults = prev.filter((result) => result.multipv !== multipv);
              return [...updatedResults, {
                depth,
                multipv,
                scoreCp,
                scoreMate,
                continuation,
              }];
            });
            setCurrentDepth(depth);
          }
        }
      }
    };
  
    // Send initial commands to the Stockfish engine
    engineWorker.postMessage("uci");
    engineWorker.postMessage(`setoption name MultiPV value ${multiPV}`);
    engineWorker.postMessage(`position fen ${fen}`);
    engineWorker.postMessage(`go depth ${maxDepth}`);
  
    return () => {
      engineWorker.postMessage("stop");
      engineWorker.terminate();
    };
  }, [fen, maxDepth, multiPV]);

  return (
    <Card className="select-none w-full">
      <div className="flex flex-row p-4 justify-between items-center">
        <h3>Analysis</h3>
        <p>Depth: {currentDepth}</p>
      </div>
      <Separator />
      <div className="flex flex-col p-4 gap-2">
        {Array.from({ length: multiPV }, (_, index) => {
          const result = engineResults[index] || { scoreCp: null, scoreMate: null, continuation: [] };
          const isWhitesTurn = currentPly % 2 === 0;

          const formattedContinuation = result.continuation.map((move, i) => {
            return isWhitesTurn && i % 2 === 0 ? `${move}` : `${move}`;
          });

          return (
            <div key={index} className="grid grid-cols-[60px_40px_1fr] gap-3 items-center h-5">
              <Badge className={`font-mono text-sm p-0 rounded-md block text-center ${(result.scoreCp || result.scoreMate) >= 0 ? "bg-white text-black" : "bg-black text-white"}`}>
                {formatEval(result.scoreCp, result.scoreMate)}
              </Badge>
              <h4>{formattedContinuation[0] || "-"}</h4> 
              <p className="whitespace-nowrap overflow-hidden text-ellipsis">{formattedContinuation.slice(1).join(" ") || "-"}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AnalysisInterface;
