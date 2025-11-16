import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Game, Variant, historyToAlgebraics, parse, stringify } from "common";
import { io, Socket } from "socket.io-client";

import PlayChessboard from "@/components/PlayChessboard";
import { PieceCard } from "@/components/PieceCard";
import { CopyableLink } from "@/components/ui/CopyableLink";
import VariantConfigDialog from "@/components/VariantConfigDialog";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Play = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  console.log('Play.tsx: Component rendered. roomId:', roomId);
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [currentVariant, setCurrentVariant] = useState<Variant | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [plyIndex, setPlyIndex] = useState<number>(0);
  const [isVariantConfigDialogOpen, setIsVariantConfigDialogOpen] = useState<boolean>(false);

  const plyIndexRef = useRef<HTMLParagraphElement>(null);
  const playerIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (plyIndexRef.current) {
      plyIndexRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [plyIndex]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log('Play.tsx: useEffect for socket setup triggered.');

    if (!roomId) {
      console.log('Play.tsx: roomId is null, skipping socket initialization.');
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
      console.log('Play.tsx: Socket already initialized and connected for this roomId, skipping.');
      return;
    }

    // Disconnect any existing socket if the roomId has changed or not connected.
    if (socketRef.current && (socketRef.current.io.opts.query?.roomId !== roomId || !socketRef.current.connected)) {
        console.log('Play.tsx: RoomId changed or socket not connected, disconnecting old socket.');
        socketRef.current.disconnect();
        socketRef.current = null;
    }

    const newSocket = io('http://localhost:3001', {
      query: { roomId } 
    });
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Play.tsx: Socket connected.');
      console.log(`Play.tsx: Emitting joinRoom for roomId: ${roomId}`);
      newSocket.emit('joinRoom', roomId);
    });

    newSocket.on('playerInfo', (data) => {
      console.log('Play.tsx: Received playerInfo:', data);
      const { playerIndex } = data;
      playerIndexRef.current = playerIndex;
      setPlayerIndex(playerIndex);
    });

    newSocket.on('playerJoined', (data) => {
      console.log('Play.tsx: Received playerJoined:', data);
      const { playerIndex: joinedPlayerIndex } = data;
      console.log(`Play.tsx: Player ${joinedPlayerIndex} joined the room`);
    });

    newSocket.on('gameStart', (data) => {
      console.log('Play.tsx: Received gameStart:', data);
      const { game: serverGame } = data;
      console.log('Play.tsx: Game starting!', serverGame);
      setGame(parse(stringify(serverGame)));
      setCurrentVariant(parse(stringify(serverGame))); 
    });

    newSocket.on('gameUpdated', (updatedGame: Game) => {
      console.log('Play.tsx: Received gameUpdated:', updatedGame);
      setGame(parse(stringify(updatedGame)));
    });

    newSocket.on('playerLeft', (data) => {
      console.log('Play.tsx: Received playerLeft:', data);
      const { playerIndex } = data;
      console.log(`Play.tsx: Player ${playerIndex} left the room`);
    });

    newSocket.on('error', (errorMessage: string) => {
      console.error('Play.tsx: Received error from server:', errorMessage);
    });

    newSocket.on('disconnect', () => {
      console.log('Play.tsx: Disconnected from Socket.IO server.');
    });

    return () => {
      if (socketRef.current) {
        console.log('Play.tsx: Disconnecting socket on cleanup.');
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

  return (
    <div className="w-full flex flex-row gap-6 px-4 md:px-8 py-6 h-[calc(100vh-62px)]">
      <Card className="w-1/4 p-4 flex flex-col gap-4">
        {variantToDisplay && (
          <>
            <h2 className="text-lg font-semibold mb-2">{variantToDisplay.name}</h2>
            <p>time</p>

            <Separator /> 
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
          <PlayChessboard game={game} setGame={setGame} socket={socket} roomId={roomId} isMyTurn={game.turn === playerIndex && !game.gameEndResult} playerIndex={playerIndex} />
        ) : (
          <CopyableLink />
        )}
      </div>
      <Card className="w-[350px] flex flex-col">
        <div className="p-4">
          black clock
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
          white clock
        </div>
      </Card>
    </div>
  );
};

export default Play;