import { useEffect, useRef } from "react"; 

import { formatDate, formatTime } from "@/lib/utils";

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

const GameNavigationInterface = ({ game, moves, moveTimestamps, currentPly, setCurrentPly, isDailyGame, handlePlyNavigation, handleFlipBoardOrientation }) => {
  const currentMoveRef = useRef(null);

  useEffect(() => {
    if (currentMoveRef.current) {
      currentMoveRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentPly]);

  let timeControlString = "";
  if (isDailyGame) {
    timeControlString = `$0+{game.daysPerTurn} days Daily`;
  } else {
    const base = game.baseTime1;
    const inc = game.timeIncrement1;

    const category = base < 1800 ? "Bullet" :
      base < 6000 ? "Blitz" : "Rapid";

    const baseString = base < 600 ? `${base / 10} sec` : `${base / 600}`;
    const incString = (inc / 10).toString();

    timeControlString = `${baseString}+${incString} ${category}`;
  }

  return (
    <Card className="w-1/4 flex flex-col h-full">
      <div className="p-4">
        <h3>{game.isRated ? "Rated" : "Unrated"} {timeControlString}</h3>
        <p>{!isDailyGame ? formatDate(game.endTime, true) : 0}</p>
        <p>{game.resultMessage}</p>
      </div>
      <Separator />
      <ScrollArea className="flex-grow py-2">
        <div className="grid gap-0.5 px-4 overflow-y-auto">
          {moves.map((move, index) => {
            if (index % 2 === 0) {
              return (
                <div key={index} className="select-none grid grid-cols-[40px_1fr_1fr_0.5fr] gap-1 items-center">
                  <p>{Math.floor(index / 2) + 1}.</p>
                  <h4
                    ref={currentPly === index + 1 ? currentMoveRef : null}
                    onClick={() => setCurrentPly(index + 1)} className={`hover:bg-accent cursor-pointer px-2 py-1 ${currentPly === index + 1 ? "bg-accent" : ""}`}
                  >
                    {move}
                  </h4>
                  {moves[index + 1] ?
                    <h4
                      onClick={() => setCurrentPly(index + 2)}
                      className={`hover:bg-accent cursor-pointer px-2 py-1 ${currentPly === index + 2 ? "bg-accent" : ""}`}
                    >
                      {moves[index + 1]}
                    </h4> :
                    <h4 />
                  }
                  <div className="flex flex-col">
                    <small className="text-end">{index > 0 ? formatTime(moveTimestamps[index - 2] - moveTimestamps[index], false) : formatTime(game.baseTime1 - moveTimestamps[0], false)}</small>
                    <small className="text-end">{index > 0 ? formatTime(moveTimestamps[index - 1] - moveTimestamps[index + 1], false) : formatTime(game.baseTime1 - moveTimestamps[1], false)}</small>
                  </div>
                </div>
              );
            }
            // Only render first move of each pair
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
