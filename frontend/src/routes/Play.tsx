import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Game, Move, Variant, historyToAlgebraics, parse, stringify } from "common";
import { io, Socket } from "socket.io-client";

import PlayChessboard from "@/components/PlayChessboard";
import { PieceCard } from "@/components/PieceCard";
import { CopyableLink } from "@/components/ui/CopyableLink";
import VariantConfigDialog from "@/components/VariantConfigDialog";
import ChessClock from "@/components/ChessClock";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

// Helper function to parse time control string (e.g., "3+2" -> {base: 3, increment: 2})
const parseTimeControlString = (timeControl: string): { base: number; increment: number } => {
  const parts = timeControl.split('+').map(Number);
  const base = parts[0] || 0;
  const increment = parts[1] || 0;
  return { base, increment };
};


const Play = () => {
  const { roomId } = useParams<{ roomId: string }>();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [currentVariant, setCurrentVariant] = useState<Variant | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [plyIndex, setPlyIndex] = useState<number>(0);
  const [isVariantConfigDialogOpen, setIsVariantConfigDialogOpen] = useState<boolean>(false);

  const [whiteTime, setWhiteTime] = useState<number>(0);
  const [blackTime, setBlackTime] = useState<number>(0);
  const [clocksRunning, setClocksRunning] = useState<boolean>(false);

  const [whiteCurrentActualTime, setWhiteCurrentActualTime] = useState<number>(0);
  const [blackCurrentActualTime, setBlackCurrentActualTime] = useState<number>(0);


  const plyIndexRef = useRef<HTMLParagraphElement>(null);
  const playerIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (plyIndexRef.current) {
      plyIndexRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [plyIndex]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const fetchRoomVariant = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/rooms/${roomId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = parse(await response.text());
        setCurrentVariant(data.variant);
      } catch (e: any) {
        console.error("Failed to fetch room variant:", e);
      }
    };

    fetchRoomVariant();

    // Prevents re-initializing the socket on subsequent re-renders for the same room.
    if (socketRef.current && socketRef.current.connected && socketRef.current.io.opts.query?.roomId === roomId) {
      return;
    }

    // Disconnect any existing socket if the roomId has changed or not connected.
    if (socketRef.current && (socketRef.current.io.opts.query?.roomId !== roomId || !socketRef.current.connected)) {
        socketRef.current.disconnect();
        socketRef.current = null;
    }

    const newSocket = io('http://localhost:3001', {
      query: { roomId } 
    });
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('joinRoom', roomId);
    });

    newSocket.on('playerInfo', (data) => {
      const { playerIndex } = data;
      playerIndexRef.current = playerIndex;
      setPlayerIndex(playerIndex);
    });

    newSocket.on('playerJoined', (data) => {
      const { playerIndex: joinedPlayerIndex } = data;
    });

    newSocket.on('gameStart', (data) => {
      const { game: serverGame } = data;
      const parsedGame: Game = parse(stringify(serverGame));
      setGame(parsedGame);
      setCurrentVariant(parsedGame); // currentVariant also needs timeControl
      if (parsedGame.remainingTime) {
        setWhiteTime(parsedGame.remainingTime[0]);
        setBlackTime(parsedGame.remainingTime[1]);
        setWhiteCurrentActualTime(parsedGame.remainingTime[0]); // Initialize actual times
        setBlackCurrentActualTime(parsedGame.remainingTime[1]); // Initialize actual times
        setClocksRunning(true);
      }
    });

    newSocket.on('gameUpdated', (updatedGame: Game) => {
      const parsedGame: Game = parse(stringify(updatedGame));
      setGame(parsedGame);
      if (parsedGame.remainingTime) {
        setWhiteTime(parsedGame.remainingTime[0]);
        setBlackTime(parsedGame.remainingTime[1]);
        // Do NOT update actual times here, as they are managed by the ChessClock component
      }
      if (parsedGame.gameEndResult) {
        setClocksRunning(false);
      }
    });

    newSocket.on('playerLeft', (data) => {
      const { playerIndex } = data;
    });

    newSocket.on('error', (errorMessage: string) => {
      console.error('Play.tsx: Received error from server:', errorMessage);
    });

    newSocket.on('disconnect', () => {
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId]);

  const [openPieceDialogId, setOpenPieceDialogId] = useState<string | null>(null);

  const handlePlyNavigation = (direction: "start" | "left" | "right" | "end") => {
    if (!game) return;
    const maxPly = game.history.length;
    if (direction === "start") {
      setPlyIndex(0);
    } else if (direction === "left") {
      setPlyIndex(Math.max(0, plyIndex - 1));
    } else if (direction === "right") {
      setPlyIndex(Math.min(maxPly, plyIndex + 1));
    } else if (direction === "end") {
      setPlyIndex(maxPly);
    }
  };

  const variantToDisplay = game || currentVariant;
  const { increment: timeIncrement } = variantToDisplay?.timeControl ? parseTimeControlString(variantToDisplay.timeControl) : { base: 0, increment: 0 };


  const onTimeUp = (color: 0 | 1) => {
    if (!game || !socket) return;
    setClocksRunning(false);
    console.log(`Player ${color} ran out of time!`);
  };

  // Callbacks to update the actual current time from ChessClock
  const handleWhiteTimeUpdate = (time: number) => {
    setWhiteCurrentActualTime(time);
  };

  const handleBlackTimeUpdate = (time: number) => {
    setBlackCurrentActualTime(time);
  };

  const handleChessMove = (move: Move) => {
    if (!socket || !game || playerIndex === null) return;
    const currentPlayerRemainingTime = playerIndex === 0 ? whiteCurrentActualTime : blackCurrentActualTime;

    socket.emit('chessMove', { roomId, move, currentPlayerRemainingTime });
  };

  const BlackClock = (
    <ChessClock
      initialTime={blackTime}
      isRunning={clocksRunning && game?.turn === 1 && !game?.gameEndResult}
      onTimeUp={() => onTimeUp(1)}
      onTimeUpdate={handleBlackTimeUpdate}
      playerColor={1}
      currentTurn={game?.turn ?? 0}
      increment={timeIncrement}
    />
  );

  const WhiteClock = (
    <ChessClock
      initialTime={whiteTime}
      isRunning={clocksRunning && game?.turn === 0 && !game?.gameEndResult}
      onTimeUp={() => onTimeUp(0)}
      onTimeUpdate={handleWhiteTimeUpdate} // Pass the update callback
      playerColor={0}
      currentTurn={game?.turn ?? 0}
      increment={timeIncrement}
    />
  );

  return (
    <div className="w-full flex flex-row gap-6 px-4 md:px-8 py-6 h-[calc(100vh-62px)]">
      <Card className="w-1/4 p-4 flex flex-col gap-4">
        {variantToDisplay && (
          <>
            <h2 className="text-lg font-semibold mb-2">{variantToDisplay.name}</h2>
            <p>Time Control: {variantToDisplay.timeControl}</p>

            <ScrollArea className="flex-grow">
              <div className="grid gap-2 grid-cols-1">
                {variantToDisplay.pieces.map((piece) => {
                  const isRoyal = variantToDisplay.royals.includes(piece.id);
                  return (
                    <PieceCard
                      key={piece.id}
                      piece={piece}
                      selectedPieceId={null}
                      setSelectedPieceId={() => {}}
                      selectedPieceColor={0}
                      isRoyal={isRoyal}
                      setVariant={() => {}}
                      variant={variantToDisplay} 
                      isEditable={false}
                      pieceConfig={piece}
                      setPieceConfig={() => {}}
                      pieceConfigErrors={{}} 
                      setPieceConfigErrors={() => {}}
                      handlePieceInputChange={() => {}}
                      handlePieceConfigSubmit={() => {}}
                      openPieceDialogId={openPieceDialogId}
                      setOpenPieceDialogId={setOpenPieceDialogId}
                      handlePieceDelete={() => {}}
                      showCrown={true}
                      showEditButton={true}
                    />
                  );
                })}
              </div>
            </ScrollArea>
            <VariantConfigDialog
              variant={variantToDisplay}
              setVariant={() => {}}
              isGameConfigureDialogOpen={isVariantConfigDialogOpen}
              setIsGameConfigureDialogOpen={setIsVariantConfigDialogOpen}
              isEditable={false}
              trigger={<Button className="w-full">Variant Details</Button>}
            />
          </>
        )}
      </Card>
      <div className="w-1/2">
        {game ? (
          <PlayChessboard
            game={game}
            setGame={setGame}
            socket={socket}
            roomId={roomId}
            isMyTurn={game.turn === playerIndex && !game.gameEndResult}
            playerIndex={playerIndex}
            onMoveMade={handleChessMove}
            lastMove={game && game.history.length > 0 ? game.history[game.history.length - 1] : null}
          />
        ) : (
          <CopyableLink shareUrl={`${window.location.origin}/play/${roomId}`} />
        )}
      </div>
      <Card className="w-[350px] flex flex-col">
        <div className="p-4">
          {playerIndex === 0 ? BlackClock : WhiteClock}
        </div>
        <Separator />
        <ScrollArea className="flex-grow py-2">
          <div className="flex flex-col gap-0.5 px-4">
            {
              game && (() => {
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
          {playerIndex === 0 ? WhiteClock : BlackClock}
        </div>
      </Card>
    </div>
  );
};

export default Play;