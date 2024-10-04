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

  const [whiteReport, setWhiteReport] = useState({ accuracy: 0, averageCpLoss: 0, moveCount: 0, inaccuracyCount: 0, mistakeCount: 0, blunderCount: 0 });
  const [blackReport, setBlackReport] = useState({ accuracy: 0, averageCpLoss: 0, moveCount: 0, inaccuracyCount: 0, mistakeCount: 0, blunderCount: 0 });

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
      if (winProbLoss > 0.2) {
        moveCategory = "blunder";
      } else if (winProbLoss > 0.12) {
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

      let whiteMoveCount = 0;
      let blackMoveCount = 0;
      let whiteTotalWinProbLoss = 0;
      let blackTotalWinProbLoss = 0;
      let whiteTotalCpLoss = 0;
      let blackTotalCpLoss = 0;

      let whiteInaccuracyCount = 0;
      let blackInaccuracyCount = 0;
      let whiteMistakeCount = 0;
      let blackMistakeCount = 0;
      let whiteBlunderCount = 0;
      let blackBlunderCount = 0;

      for (let i = 0; i < moves.length; i++) {
        const analysis = await getMoveAnalysis(chess.fen(), moves[i]);
        setMoveAnalyses((prev) => [...(prev || []), analysis]);

        let cpDiff = 0;
        if (analysis.evalBeforeMove.cp === null && analysis.evalAfterMove.afterCp === null) {
    
          if (analysis.evalBeforeMove.mateIn !== null) {
            cpDiff = 1000;
          }
        } else {
          cpDiff = analysis.evalBeforeMove.cp - analysis.evalAfterMove.cp;
        }

        if (i % 2 === 0) {
          whiteMoveCount++;
          whiteTotalWinProbLoss += Math.min(analysis.winProbLoss / 0.1, 1);
          whiteTotalCpLoss += Math.min(Math.max(cpDiff, 0), 1000);

          switch (analysis.moveCategory) {
            case "inaccuracy":
              whiteInaccuracyCount++; break;
            case "mistake":
              whiteMistakeCount++; break;
            case "blunder":
              whiteBlunderCount++; break;
          }  
        } else {
          blackMoveCount++;
          blackTotalWinProbLoss += Math.min(analysis.winProbLoss / 0.1, 1);
          blackTotalCpLoss += Math.min(Math.max(-cpDiff, 0), 1000);

          switch (analysis.moveCategory) {
            case "inaccuracy":
              blackInaccuracyCount++; break;
            case "mistake":
              blackMistakeCount++; break;
            case "blunder":
              blackBlunderCount++; break;
          }
        }

        setReportProgress(i / moves.length * 100);
        chess.move(moves[i]);
      }

      setWhiteReport({
        accuracy: (1 - whiteTotalWinProbLoss / whiteMoveCount) * 100,
        averageCpLoss: Math.max(whiteTotalCpLoss / whiteMoveCount, 0),
        moveCount: whiteMoveCount,
        inaccuracyCount: whiteInaccuracyCount,
        mistakeCount: whiteMistakeCount,
        blunderCount: whiteBlunderCount,
      });

      setBlackReport({
        accuracy: (1 - blackTotalWinProbLoss / blackMoveCount) * 100,
        averageCpLoss: Math.max(blackTotalCpLoss / blackMoveCount, 0),
        moveCount: blackMoveCount,
        inaccuracyCount: blackInaccuracyCount,
        mistakeCount: blackMistakeCount,
        blunderCount: blackBlunderCount,
      });

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
            <Button onClick={() => runGameReport()} className="w-min">
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
            <div className="grid grid-cols-2">
              <div className="flex flex-col gap-0.5">
                <h3>White</h3>
                <p>Accuracy: {whiteReport.accuracy.toFixed(2)}%</p>
                <p>ACL: {whiteReport.averageCpLoss.toFixed(2)}</p>
                <p>Move Count: {whiteReport.moveCount}</p>
                <p>Inaccuracies: {whiteReport.inaccuracyCount}</p>
                <p>Mistakes: {whiteReport.mistakeCount}</p>
                <p>Blunders: {whiteReport.blunderCount}</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <h3>Black</h3>
                <p>Accuracy: {blackReport.accuracy.toFixed(2)}%</p>
                <p>ACL: {blackReport.averageCpLoss.toFixed(2)}</p>
                <p>Move Count: {blackReport.moveCount}</p>
                <p>Inaccuracies: {blackReport.inaccuracyCount}</p>
                <p>Mistakes: {blackReport.mistakeCount}</p>
                <p>Blunders: {blackReport.blunderCount}</p>
              </div>
            </div>
          </>
        }
      </div>
    </Card>
  );
};

export default GameReportInterface;