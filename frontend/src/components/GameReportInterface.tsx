import { useRef, useEffect, useState } from "react";

import { Chess, DEFAULT_POSITION } from "chess.js";
import { evalToWhiteWinProb, createWinProbLossBuckets } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CartesianGrid, Line, LineChart, Bar, BarChart, XAxis, YAxis, ReferenceArea } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

const GameReportInterface = ({ game, currentPly, setCurrentPly, reportStatus, setReportStatus, moveAnalyses, setMoveAnalyses }) => {
  const [reportDepth, setReportDepth] = useState(12);
  const [reportProgress, setReportProgress] = useState(0);
  const [whiteReport, setWhiteReport] = useState({ averageCpLoss: 0, moveCount: 0, counts: { best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0 } });
  const [blackReport, setBlackReport] = useState({ averageCpLoss: 0, moveCount: 0, counts: { best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0 } });

  const BEST_LENIENCY = 0.01;
  const INACCURACY_THRESHOLD = 0.06;
  const MISTAKE_THRESHOLD = 0.12;
  const BLUNDER_THRESHOLD = 0.20;

  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker("/stockfish-16.1-lite-single.js");
    
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage("stop");
        workerRef.current.terminate();
      }
    };
  }, []);

  const runGameReport = () => {
    setReportStatus("running");
  
    const getEval = (fen, depth) => {
      return new Promise((resolve) => {
        workerRef.current.onmessage = (event) => {
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
  
        workerRef.current.postMessage("uci");
        workerRef.current.postMessage(`position fen ${fen}`);
        workerRef.current.postMessage(`go depth ${depth}`);
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

      const winProbLoss = chess.turn() === "w" ?
        Math.max(evalToWhiteWinProb(evalAfterMove) - evalToWhiteWinProb(evalBeforeMove), 0) :
        Math.max(evalToWhiteWinProb(evalBeforeMove) - evalToWhiteWinProb(evalAfterMove), 0);

      let moveCategory, description;

      description = "?";
      if (winProbLoss > BLUNDER_THRESHOLD) {
        moveCategory = "blunder";
      } else if (winProbLoss > MISTAKE_THRESHOLD) {
        moveCategory = "mistake";
      } else if (winProbLoss > INACCURACY_THRESHOLD) {
        moveCategory = "inaccuracy";
      } else if (winProbLoss > BEST_LENIENCY) {
        moveCategory = "good";
      } else {
        moveCategory = "best";
      }

      return { move, evalBeforeMove, evalAfterMove, winProbLoss, moveCategory, description };
    };
  
    const analyzeAllMoves = async () => {
      let chess = new Chess(DEFAULT_POSITION);

      let whiteMoveCount = 0;
      let blackMoveCount = 0;
      let whiteTotalCpLoss = 0;
      let blackTotalCpLoss = 0;

      const moveCategoryCounts = {
        best: 0,
        good: 0,
        inaccuracy: 0,
        mistake: 0,
        blunder: 0,
    };
    
    const whiteCounts = { ...moveCategoryCounts };
    const blackCounts = { ...moveCategoryCounts };

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
          if (analysis.moveCategory in whiteCounts) {
            whiteCounts[analysis.moveCategory]++;
          }
        } else {
          blackMoveCount++;
          blackTotalCpLoss += Math.min(Math.max(-cpDiff, 0), 1000);
          if (analysis.moveCategory in blackCounts) {
            blackCounts[analysis.moveCategory]++;
          }
        }

        setReportProgress(i / game.moves.length * 100);
        chess.move(game.moves[i]);
      }

      setWhiteReport({
        averageCpLoss: Math.max(whiteTotalCpLoss / whiteMoveCount, 0),
        moveCount: whiteMoveCount,
        counts: whiteCounts,
      });

      setBlackReport({
        averageCpLoss: Math.max(blackTotalCpLoss / blackMoveCount, 0),
        moveCount: blackMoveCount,
        counts: blackCounts,
      });

      setReportStatus("complete");
      setCurrentPly(0);
    };
  
    analyzeAllMoves();
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
    <Card className="flex flex-col w-full flex-grow overflow-auto">
      <div className="flex flex-row justify-between items-center p-4">
        <h3>Game Report</h3>
        {reportStatus === "idle" && 
          <Button size="sm" onClick={() => runGameReport()} className="-my-2">
            Request
          </Button>
        }
        {reportStatus === "complete" && 
          <div className="flex flex-row gap-2">
            <p>Report depth: {reportDepth}</p>
            <Button size="sm" onClick={() => clearGameReport()} className="-my-2">
              Clear
            </Button>
          </div>
        }
      </div>
      <Separator />
      <ScrollArea className="h-full">
        <div className="flex flex-col px-4 gap-5">
          {reportStatus === "idle" && (
            <div className="grid grid-cols-[150px_1fr] gap-4 mt-4">
              <h4>Engine Depth: {reportDepth}</h4>
              <Slider
                value={[reportDepth]}
                onValueChange={(value) => setReportDepth(value[0])}
                min={10}
                max={20}
                step={1}
              />
            </div>
          )}
          {reportStatus === "running" && (
            <>
              <Progress value={reportProgress} className="mt-6" />
            </>
          )}
          {reportStatus === "complete" &&
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Category</TableHead>
                    <TableHead className="text-center">White</TableHead>
                    <TableHead className="text-center">Black</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-left font-medium">Best</TableCell>
                    <TableCell>{whiteReport.counts.best}</TableCell>
                    <TableCell>{blackReport.counts.best}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left font-medium">Good</TableCell>
                    <TableCell>{whiteReport.counts.good}</TableCell>
                    <TableCell>{blackReport.counts.good}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left font-medium">Inaccuracies (<span className="font-semibold text-inaccuracy">?!</span>)</TableCell>
                    <TableCell>{whiteReport.counts.inaccuracy}</TableCell>
                    <TableCell>{blackReport.counts.inaccuracy}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left font-medium">Mistakes (<span className="font-semibold text-mistake">?</span>)</TableCell>
                    <TableCell>{whiteReport.counts.mistake}</TableCell>
                    <TableCell>{blackReport.counts.mistake}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left font-medium">Blunders (<span className="font-semibold text-blunder">??</span>)</TableCell>
                    <TableCell>{whiteReport.counts.blunder}</TableCell>
                    <TableCell>{blackReport.counts.blunder}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

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
                    label={{ value: "Move number", position: "insideBottom", dy: 10 }}
                    ticks={[1, ...Array.from(
                      { length: Math.ceil((moveAnalyses.length + 2) / 10) }, 
                      (_, i) => i * 10 - 1
                    )]}
                    tickFormatter={(value) => `${Math.floor((value + 1) / 2)}`}
                  />
                  <YAxis
                    width={60}
                    label={{ value: "White win probability", angle: -90, position: "insideBottomLeft" }}
                    domain={[-5, 105]}
                    ticks={[0, 25, 50, 75, 100]}
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

                        const bucketIndex = analysis.winProbLoss < BEST_LENIENCY ? 0 : Math.min(Math.floor(analysis.winProbLoss / 0.02) + 1, buckets.length - 1);
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
                  barGap={0}
                >
                  <CartesianGrid stroke="hsl(var(--accent))" vertical={false} />
                  <XAxis
                    dataKey="range"
                    label={{ value: "Win probability loss (%p)", position: "insideBottom", dy: 10 }}
                  />
                  <YAxis
                    width={40}
                    label={{ value: "Move Count", angle: -90, position: "insideBottomLeft" }}
                  />
                  <Bar dataKey="white" fill="#fff" />
                  <Bar dataKey="black" fill="#666" />
                  <ReferenceArea x1="6-8" x2="10-12" fill="yellow" fillOpacity={0.15} />
                  <ReferenceArea x1="12-14" x2="18-20" fill="orange" fillOpacity={0.15} />
                  <ReferenceArea x1=">20" x2={undefined} fill="red" fillOpacity={0.15} />
                </BarChart>
              </ChartContainer>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Metric</TableHead>
                    <TableHead className="text-center">White</TableHead>
                    <TableHead className="text-center">Black</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-left font-medium">ACPL</TableCell>
                    <TableCell>{whiteReport.averageCpLoss.toFixed(2)}</TableCell>
                    <TableCell>{blackReport.averageCpLoss.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          }
        </div>
      </ScrollArea>
    </Card>
  );
};

export default GameReportInterface;
