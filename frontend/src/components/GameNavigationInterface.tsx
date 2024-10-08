import { useEffect, useRef } from "react"; 

import { formatDate, formatTime, getMoveCategoryTextColor, getMoveCategorySuffix, formatDailyTime } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, FlipVertical, Pencil, Share } from "lucide-react";

const GameNavigationInterface = ({ game, moveAnalyses, currentPly, setCurrentPly, handlePlyNavigation, handleFlipBoardOrientation, reportStatus }) => {
  const currentMoveRef = useRef(null);

  useEffect(() => {
    if (currentMoveRef.current) {
      currentMoveRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentPly]);

  let timeControlString = game.event;
  if (game.timeControl) {
    if (game.isLiveGame) {
      const timeControlCategory = game.timeControl.base < 180 ? "Bullet" :
        game.timeControl.base < 600 ? "Blitz" : "Rapid";
  
      const baseString = game.timeControl.base < 60 ? `${game.timeControl.base} sec` : `${game.timeControl.base / 60}`;
      const incString = game.timeControl.increment.toString();
      timeControlString = `${timeControlCategory}: ${baseString}+${incString}`;
    } else {
      timeControlString = `Daily: ${game.timeControl.daysPerTurn} day${game.timeControl.daysPerTurn === 1 ? "" : "s"}/move`
    }
  }

  return (
    <Card className="w-1/4 flex flex-col h-full">
      <div className="p-4">
        <h3>{timeControlString}</h3>
        <p>Date: {game.date}</p>
        <p>{game.resultMessage}</p>
      </div>
      <Separator />
      <ScrollArea className="flex-grow py-2">
        <div className="grid gap-0.5 px-4 overflow-y-auto">
          {game.moves.map((move, index) => {
            const isWhiteMove = index % 2 === 0;
            const moveNumber = Math.floor(index / 2) + 1;

            if (isWhiteMove) {
              const nextMove = game.moves[index + 1]; // Black's move
              let whiteMoveTime = "";
              let blackMoveTime = "";
              if (game.timestamps && game.timeControl){
                if (game.isLiveGame) {
                  whiteMoveTime = index > 0 ? formatTime(game.timestamps[index - 2] - game.timestamps[index] + game.timeControl.increment, false) : formatTime(game.timeControl.base - game.timestamps[0] + game.timeControl.increment, false);
                  blackMoveTime = nextMove ? (index > 0 ? formatTime(game.timestamps[index - 1] - game.timestamps[index + 1] + game.timeControl.increment, false) : formatTime(game.timeControl.base - game.timestamps[1] + game.timeControl.increment, false)) : " ";
                } else {
                  whiteMoveTime = formatDailyTime(game.timeControl.daysPerTurn * 86400 - game.timestamps[index]);
                  blackMoveTime = formatDailyTime(game.timeControl.daysPerTurn * 86400 - game.timestamps[index + 1]);
                }
              }

              return (
                <div key={index} className="select-none grid grid-cols-[40px_1fr_1fr_0.5fr] gap-1 items-center">
                  <p>{moveNumber}.</p>

                  {/* White's move */}
                  <h4
                    ref={currentPly === index + 1 ? currentMoveRef : null}
                    onClick={() => setCurrentPly(index + 1)}
                    className={`hover:bg-accent cursor-pointer px-2 py-1 ${currentPly === index + 1 ? "bg-accent" : ""}`}
                  >
                    {move}{" "}
                    {reportStatus === "complete" && 
                      <span className={`font-semibold ${getMoveCategoryTextColor(moveAnalyses[index].moveCategory)}`}>
                        {getMoveCategorySuffix(moveAnalyses[index].moveCategory)}
                      </span>
                    }
                  </h4>

                  {/* Black's move */}
                  {nextMove ? (
                    <h4
                      onClick={() => setCurrentPly(index + 2)}
                      className={`hover:bg-accent cursor-pointer px-2 py-1 ${currentPly === index + 2 ? "bg-accent" : ""}`}
                    >
                      {nextMove}{" "}
                      {reportStatus === "complete" && 
                        <span className={`font-semibold ${getMoveCategoryTextColor(moveAnalyses[index + 1].moveCategory)}`}>
                          {getMoveCategorySuffix(moveAnalyses[index + 1].moveCategory)}
                        </span>
                      }
                    </h4>
                  ) : (
                    <h4 />
                  )}

                  {/* Timestamps */}
                  {game.timestamps && game.timeControl &&
                    <div className="flex flex-col">
                      <small className="text-end">{whiteMoveTime}</small>
                      {nextMove && <small className="text-end">{blackMoveTime}</small>}
                    </div>
                  }
                </div>
              );
            }

            return null;
          })}
        </div>
      </ScrollArea>
      <Separator />
      <div className="flex flex-row p-4 gap-2 justify-between">
        <div className="flex flex-row gap-1">
          <Button variant="secondary" size="icon" onClick={() => handlePlyNavigation("start")}><ChevronsLeft size={20} /></Button>
          <Button variant="secondary" size="icon" onClick={() => handlePlyNavigation("left")}><ChevronLeft size={20} /></Button>
          <Button variant="secondary" size="icon" onClick={() => handlePlyNavigation("right")}><ChevronRight size={20} /></Button>
          <Button variant="secondary" size="icon" onClick={() => handlePlyNavigation("end")}><ChevronsRight size={20} /></Button>
        </div>
        <div className="flex flex-row gap-1">
          <Button variant="secondary" size="icon" onClick={() => handleFlipBoardOrientation()}><FlipVertical size={20} /></Button>
          <Button variant="secondary" size="icon"><Pencil size={20} /></Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="icon"><Share size={20} /></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="text-start">
                <DialogTitle>Share game</DialogTitle>
                <DialogDescription>asdf</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <h4>Pawnpulse</h4><div>a</div>
                <h4>Chess.com</h4><div>a</div>
                <h4>PGN</h4><div>a</div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
}

export default GameNavigationInterface;
