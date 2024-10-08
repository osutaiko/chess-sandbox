import { useState } from "react";

import { Chess, DEFAULT_POSITION } from "chess.js";
import { evalToWhiteWinProb, getMoveCategoryBgColor, createWinProbLossBuckets } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

import { CartesianGrid, Line, LineChart, Bar, BarChart, XAxis, YAxis, ReferenceArea } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

const GameReportInterface = ({ game, currentPly, setCurrentPly, moveAnalyses, setMoveAnalyses, reportStatus, setReportStatus }) => {
  const [reportDepth, setReportDepth] = useState(12);
  const [reportProgress, setReportProgress] = useState(0);
  const [whiteReport, setWhiteReport] = useState({ averageCpLoss: 0, moveCount: 0, inaccuracyCount: 0, mistakeCount: 0, blunderCount: 0 });
  const [blackReport, setBlackReport] = useState({ averageCpLoss: 0, moveCount: 0, inaccuracyCount: 0, mistakeCount: 0, blunderCount: 0 });

  const INACCURACY_THRESHOLD = 0.06;
  const MISTAKE_THRESHOLD = 0.12;
  const BLUNDER_THRESHOLD = 0.20;

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

      description = "?";
      if (winProbLoss > BLUNDER_THRESHOLD) {
        moveCategory = "blunder";
      } else if (winProbLoss > MISTAKE_THRESHOLD) {
        moveCategory = "mistake";
      } else if (winProbLoss > INACCURACY_THRESHOLD) {
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
      let whiteTotalCpLoss = 0;
      let blackTotalCpLoss = 0;

      let whiteInaccuracyCount = 0;
      let blackInaccuracyCount = 0;
      let whiteMistakeCount = 0;
      let blackMistakeCount = 0;
      let whiteBlunderCount = 0;
      let blackBlunderCount = 0;

      for (let i = 0; i < game.moves.length; i++) {
        const analysis = await getMoveAnalysis(chess.fen(), game.moves[i]);
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

        setReportProgress(i / game.moves.length * 100);
        chess.move(game.moves[i]);
      }

      setWhiteReport({
        averageCpLoss: Math.max(whiteTotalCpLoss / whiteMoveCount, 0),
        moveCount: whiteMoveCount,
        inaccuracyCount: whiteInaccuracyCount,
        mistakeCount: whiteMistakeCount,
        blunderCount: whiteBlunderCount,
      });

      setBlackReport({
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

  const clearGameReport = () => {
    setMoveAnalyses(null);
    setReportStatus("idle");
    setReportProgress(0);
  }

  const CustomDot = (props) => {
    const { cx, cy, index, currentPly } = props;
    if (index === currentPly - 1) {
      return (
        <circle cx={cx} cy={cy} r={4} stroke="hsl(var(--primary))" strokeWidth={3} />
      );
    }
    return null;
  };

  return (
    <Card className="w-full h-full">
      <div className="flex flex-row justify-between items-center p-4">
        <h3>Game Report</h3>
        {reportStatus === "idle" && 
          <Button size="sm" onClick={() => runGameReport()} className="-my-2">
            Request
          </Button>
        }
        {reportStatus === "complete" && 
          <Button size="sm" onClick={() => clearGameReport()} className="-my-2">
            Clear
          </Button>
        }
      </div>
      <Separator />
      <ScrollArea className="py-2 h-full">
        <div className="flex flex-col px-4 py-2 gap-5 h-full">
          {reportStatus === "idle" && (
            <div className="grid grid-cols-[1fr_2fr] gap-4">
              <h4>Engine Depth: {reportDepth}</h4>
              <Slider
                value={[reportDepth]}
                onValueChange={(value) => setReportDepth(value[0])}
                min={8}
                max={16}
                step={1}
              />
            </div>
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
                  <p>ACPL: {whiteReport.averageCpLoss.toFixed(2)}</p>
                  <p>Move count: {whiteReport.moveCount}</p>
                  <p>Inaccuracies: {whiteReport.inaccuracyCount}</p>
                  <p>Mistakes: {whiteReport.mistakeCount}</p>
                  <p>Blunders: {whiteReport.blunderCount}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3>Black</h3>
                  <p>ACPL: {blackReport.averageCpLoss.toFixed(2)}</p>
                  <p>Move count: {blackReport.moveCount}</p>
                  <p>Inaccuracies: {blackReport.inaccuracyCount}</p>
                  <p>Mistakes: {blackReport.mistakeCount}</p>
                  <p>Blunders: {blackReport.blunderCount}</p>
                </div>
              </div>

              <ChartContainer
                config={{
                  winProb: {
                    label: "White Win Probability",
                  },
                }}
                className="min-h-[100px] h-[200px] w-full"
              >
                <LineChart
                  accessibilityLayer
                  data={moveAnalyses.map((analysis, index) => ({
                    plyNumber: index + 1,
                    winProb: evalToWhiteWinProb(analysis.evalAfterMove) * 100,
                  }))}
                  onClick={(state) => {
                    if (state && state.activePayload) {
                      setCurrentPly(state.activePayload[0].payload.plyNumber);
                    }
                  }}
                >
                  <CartesianGrid stroke="hsl(var(--accent))" vertical={false} />
                  <XAxis
                    dataKey="plyNumber"
                    ticks={[1, ...Array.from(
                      { length: Math.ceil((moveAnalyses.length + 2) / 10) }, 
                      (_, i) => i * 10 - 1
                    )]}
                    tickFormatter={(value) => `${Math.floor((value + 1) / 2)}`}
                  />
                  <YAxis
                    domain={[-5, 105]}
                    ticks={[0, 25, 50, 75, 100]}
                    label={{ value: "White win%", angle: -90, position: "insideLeft" }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Line
                    dataKey="winProb"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={<CustomDot currentPly={currentPly} />}
                    type="linear"
                  />
                </LineChart>
              </ChartContainer>

              <ChartContainer
                config={{
                  white: {
                    label: "White's win probability losses",
                  },
                  black: {
                    label: "Black's win probability losses",
                  },
                }}
                className="min-h-[100px] h-[200px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={
                    (() => {
                      const buckets = createWinProbLossBuckets(0.02);

                      moveAnalyses.forEach((analysis, index) => {
                        const isWhite = index % 2 === 0;
                        const winProbLoss = isWhite
                          ? Math.min(Math.max(evalToWhiteWinProb(analysis.evalBeforeMove) - evalToWhiteWinProb(analysis.evalAfterMove), 0), 1)
                          : Math.min(Math.max(evalToWhiteWinProb(analysis.evalAfterMove) - evalToWhiteWinProb(analysis.evalBeforeMove), 0), 1);

                        const bucketIndex = Math.min(Math.floor(winProbLoss / 0.02), buckets.length - 1);
                        if (isWhite) {
                          buckets[bucketIndex].white++;
                        } else {
                          buckets[bucketIndex].black++;
                        }
                      });

                      return buckets.map((bucket) => ({
                        range: bucket.range,
                        white: bucket.white,
                        black: bucket.black
                      }));
                    })()
                  }
                >
                  <CartesianGrid stroke="hsl(var(--accent))" vertical={false} />
                  <XAxis
                    dataKey="range"
                  />
                  <YAxis
                    label={{ value: "Move Count", angle: -90, position: "insideLeft" }}
                  />
                  <Bar dataKey="white" fill="#fff" />
                  <Bar dataKey="black" fill="#666" />
                  <ReferenceArea x1="6%-8%" x2="10%-12%" fill="yellow" fillOpacity={0.3} />
                  <ReferenceArea x1="12%-14%" x2="18%-20%" fill="orange" fillOpacity={0.3} />
                  <ReferenceArea x1=">20%" x2={undefined} fill="red" fillOpacity={0.3} />
                </BarChart>
              </ChartContainer>
            </>
          }
        </div>
      </ScrollArea>
    </Card>
  );
};

export default GameReportInterface;
