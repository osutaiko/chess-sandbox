import { useState } from "react";

import { Chess, DEFAULT_POSITION } from "chess.js";
import { evalToWhiteWinProb, getMoveCategoryBgColor } from "@/lib/utils";


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

const GameReportInterface = ({ moves, currentPly, setCurrentPly, moveAnalyses, setMoveAnalyses, reportStatus, setReportStatus }) => {
  const [reportDepth, setReportDepth] = useState(12);
  const [reportProgress, setReportProgress] = useState(0);
  // "idle", "running", "complete", ("error")

  const runGameReport = () => {
    setReportStatus("running");
    const engineWorker = new Worker("/stockfish-16.1-lite-single.js");
  
    const getEval = (fen, depth) => {
      return new Promise((resolve) => {
        engineWorker.onmessage = (event) => {
          const message = event.data;
  
          if (message.startsWith(`info depth ${depth}`)) {
            const regex = /depth (\d+) seldepth \d+ multipv (\d+) score (?:cp (-?\d+)|mate (-?\d+)) .+/;
            const match = message.match(regex);
  
            if (match) {
              let chess = new Chess(fen);
              const bestScoreCp = match[3] ? parseInt(match[3]) : null;
              const bestScoreMate = match[4] ? parseInt(match[4]) : null;
              if (chess.turn() === "w") {
                resolve({
                  cp: bestScoreCp !== null ? bestScoreCp : null,
                  mateIn: bestScoreMate !== null ? bestScoreMate : null,
                });
              } else {
                resolve({
                  cp: bestScoreCp !== null ? -bestScoreCp : null,
                  mateIn: bestScoreMate !== null ? -bestScoreMate : null,
                });
              }
            }
          }
        };
  
        engineWorker.postMessage("uci");
        engineWorker.postMessage(`position fen ${fen}`);
        engineWorker.postMessage(`go depth ${depth}`);
      });
    };
  
    const getMoveAnalysis = async (fen, move) => {
      let chess = new Chess(fen);
      const evalBeforeMove = await getEval(chess.fen(), reportDepth);
  
      chess.move(move);

      let evalAfterMove = evalBeforeMove;
      if (!chess.isGameOver()) {
        evalAfterMove = await getEval(chess.fen(), reportDepth - 1);
      }

      const winProbLoss = chess.turn() === "w" ? evalToWhiteWinProb(evalAfterMove) - evalToWhiteWinProb(evalBeforeMove) :
        evalToWhiteWinProb(evalBeforeMove) - evalToWhiteWinProb(evalAfterMove);

      let moveCategory, description;

      description = "PLACEHOLDER";
      if (winProbLoss > 0.25) {
        moveCategory = "blunder";
      } else if (winProbLoss > 0.125) {
        moveCategory = "mistake";
      } else if (winProbLoss > 0.05) {
        moveCategory = "inaccuracy";
      } else {
        moveCategory = "good";
      }

      return { move, evalBeforeMove, evalAfterMove, winProbLoss, moveCategory, description };
    };
  
    const analyzeAllMoves = async () => {
      let chess = new Chess(DEFAULT_POSITION);
      for (let i = 0; i < moves.length; i++) {
        const analysis = await getMoveAnalysis(chess.fen(), moves[i]);
        setMoveAnalyses((prev) => [...(prev || []), analysis]);
        setReportProgress(i / moves.length * 100);
        chess.move(moves[i]);
      }
      setReportStatus("complete");
      setCurrentPly(0);
    };
  
    analyzeAllMoves();
  
    return () => {
      engineWorker.postMessage("stop");
      engineWorker.terminate();
    };
  };

  return (
    <Card className="h-full">
      <div className="p-4">
        <h3>Game Report</h3>
      </div>
      <Separator />
      <div className="flex flex-col p-4 gap-5">
        {reportStatus === "idle" && (
          <>
            <div className="grid grid-cols-[1fr_2fr] gap-4">
              <h4>Engine Depth: {reportDepth}</h4>
              <Slider
                value={[reportDepth]}
                onValueChange={(value) => setReportDepth(value[0])}
                min={10}
                max={16}
                step={1}
              />
            </div>
            <Button onClick={() => runGameReport()} className="w-full">
              Request Game Report
            </Button>
          </>
        )}
        {reportStatus === "running" && (
          <>
            <Progress value={reportProgress} />
          </>
        )}
        {reportStatus === "complete" &&
          <>
            {currentPly > 0 && 
              <div className="flex flex-row gap-2 items-center">
                <Badge className={`text-2xl px-3 py-1 rounded-md ${getMoveCategoryBgColor(moveAnalyses[currentPly - 1].moveCategory)}`} variant="secondary">
                  {moveAnalyses[currentPly - 1].move}
                </Badge>
                <h2>: {moveAnalyses[currentPly - 1].moveCategory}</h2>
              </div>
            }
            
            <h3>Game Accuracy: ASDF</h3>
          </>
        }
      </div>
    </Card>
  );
};

export default GameReportInterface;
