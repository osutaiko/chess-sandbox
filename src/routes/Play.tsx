import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Game } from "@/lib/types";

import PlayChessboard from "@/components/PlayChessboard";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { historyToAlgebraics } from "@/lib/chess";

const Play = () => {
  const location = useLocation();
  const variant = location.state?.variant;
  const [game, setGame] = useState<Game>({ ...structuredClone(variant), currentBoard: structuredClone(variant.initialBoard), history: [] });
  const [plyIndex, setPlyIndex] = useState<number>(0);

  const plyIndexRef = useRef(null);

  useEffect(() => {
    if (plyIndexRef.current) {
      plyIndexRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [plyIndex]);

  return (
    <div className="w-full flex flex-row gap-6 px-4 md:px-8 py-6 h-[calc(100vh-62px)]">
      <Card className="w-1/4">
        <>rules/pieces explanation</>
      </Card>
      <div className="w-1/2">
        <PlayChessboard game={game} setGame={setGame} />
      </div>
      <Card className="w-[350px] flex flex-col">
        <div className="p-4">
          black clock
        </div>
        <Separator />
        <ScrollArea className="flex-grow py-2">
          <div className="flex flex-col gap-0.5 px-4">
            {
              (() => {
                const algebraicHistory = historyToAlgebraics(game);

                return algebraicHistory.map((move, index) => {
                  const isWhiteMove = index % 2 === 0;
                  const moveNumber = Math.floor(index / 2) + 1;

                  if (isWhiteMove) {
                    const nextMove = algebraicHistory[index + 1];

                    return (
                      <div key={index} className="grid grid-cols-[40px_1fr_1fr] gap-1 items-center">
                        <p>{moveNumber}.</p>

                        <p
                          ref={plyIndex === index + 1 ? plyIndexRef : null}
                          onClick={() => setPlyIndex(index + 1)}
                          className={`hover:bg-accent cursor-pointer px-2 py-1 ${
                            plyIndex === index + 1 ? "bg-accent" : ""
                          }`}
                        >
                          {move}
                        </p>

                        {nextMove ? (
                          <p
                            onClick={() => setPlyIndex(index + 2)}
                            className={`hover:bg-accent cursor-pointer px-2 py-1 ${
                              plyIndex === index + 2 ? "bg-accent" : ""
                            }`}
                          >
                            {nextMove}
                          </p>
                        ) : (
                          <p />
                        )}
                      </div>
                    );
                  }

                  return null;
                });
              })()
            }
          </div>
        </ScrollArea>
        <Separator />
        <div className="flex flex-row justify-between gap-2 p-3">
          <div className="flex flex-row gap-1">
            <Button variant="secondary" size="icon" onClick={() => handlePlyNavigation("start")}><ChevronsLeft size={20} /></Button>
            <Button variant="secondary" size="icon" onClick={() => handlePlyNavigation("left")}><ChevronLeft size={20} /></Button>
          </div>
          <div className="flex flex-row gap-1">
            <Button variant="secondary" size="icon" onClick={() => handlePlyNavigation("right")}><ChevronRight size={20} /></Button>
            <Button variant="secondary" size="icon" onClick={() => handlePlyNavigation("end")}><ChevronsRight size={20} /></Button>
          </div>
        </div>
        <Separator />
        <div className="p-4">
          white clock
        </div>
      </Card>
    </div>
  );
};

export default Play;