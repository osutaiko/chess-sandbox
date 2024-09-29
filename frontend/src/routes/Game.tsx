import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Chess, DEFAULT_POSITION } from "chess.js";
import { Chessboard } from "react-chessboard";

import { formatDate, formatTime, tcnToAlgebraics } from "@/lib/utils";

import MiniProfile from "@/components/MiniProfile";
import ChessClock from "@/components/ChessClock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import moveSoundFile from "@/assets/sounds/chess-move.mp3";
import captureSoundFile from "@/assets/sounds/chess-capture.mp3";

import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, FlipVertical, Pencil, Share } from "lucide-react";

const Game = () => {
  const { type, gameId } = useParams();
  const [boardWidth, setBoardWidth] = useState(400);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moves, setMoves] = useState([]);
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [currentPly, setCurrentPly] = useState(0);
  const [fen, setFen] = useState(DEFAULT_POSITION);

  const chessRef = useRef(new Chess());
  const chessboardContainerRef = useRef(null);

  const moveSound = new Audio(moveSoundFile);
  const captureSound = new Audio(captureSoundFile);

  const playMoveSound = (move) => {
    const audio = move.includes("x") ? captureSound : moveSound;
    audio.currentTime = 0;
    audio.play();
  };

  const calculateBoardWidth = () => {
    if (window.innerHeight) {
      return window.innerHeight * 0.85 - 160;
    }
    return 0;
  };

  useEffect(() => {
    const handleResize = () => {
      setBoardWidth(calculateBoardWidth());
    };
    setBoardWidth(calculateBoardWidth());
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fetchGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/api/game/${type}/${gameId}`);
      
      if (!response.ok) {
        throw new Error(response.status === 404 ? 'Game not found' : 'An error occurred');
      }

      const data = await response.json();
      setGame(data);
      const gameMoves = tcnToAlgebraics(data.game.moveList);
      setMoves(gameMoves);
    } catch (e) {
      setError(e.message);
      setGame(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const chess = chessRef.current;
    chess.reset();

    for (let i = 0; i < currentPly; i++) {
      chess.move(moves[i]);
    }

    setFen(chess.fen());
    if (currentPly > 0) playMoveSound(moves[currentPly - 1]);
  }, [currentPly, moves]);

  // Hook on load
  useEffect(() => {
    if (type && gameId) {
      fetchGame();
    }
  }, [type, gameId]);

  const handleFlipBoardOrientation = () => {
    setBoardOrientation((prevOrientation) => 
      prevOrientation === "white" ? "black" : "white"
    );
  }

  const handlePlyNavigation = (dir) => {
    switch (dir) {
      case 'left':
        if (currentPly > 0) setCurrentPly(currentPly - 1);
        break;
      case 'right':
        if (currentPly < moves.length) setCurrentPly(currentPly + 1);
        break;
      case 'start':
        setCurrentPly(0);
        break;
      case 'end':
        setCurrentPly(moves.length);
        break;
      default:
        break;
    }
  }

  // Keypress handler for arrow keys
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        handlePlyNavigation("left");
      } else if (event.key === "ArrowRight") {
        handlePlyNavigation("right");
      } else if (event.key === "ArrowUp") {
        handlePlyNavigation("start");
      } else if (event.key === "ArrowDown") {
        handlePlyNavigation("end");
      } else if (event.key === "x") {
        handleFlipBoardOrientation();
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [moves, currentPly]);

  if (loading) {
    return <h4>Loading...</h4>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!game) {
    return <h2>No game data available</h2>;
  }

  const isDailyGame = game.game.hasOwnProperty("daysPerTurn");

  let timeControlString = "";
  let moveTimestamps = [];

  // Checks for daily game
  if (isDailyGame) {
    timeControlString = `$0+{game.game.daysPerTurn} days Daily`;
    moveTimestamps = game.game.timestamps;
  } else {
    const base = game.game.baseTime1;
    const inc = game.game.timeIncrement1;

    const category = base < 1800 ? "Bullet" :
      base < 6000 ? "Blitz" : "Rapid";

    const baseString = base < 600 ? `${base / 10} sec` : `${base / 600}`;
    const incString = (inc / 10).toString();

    timeControlString = `${baseString}+${incString} ${category}`;
    moveTimestamps = game.game.moveTimestamps.split(',').map(Number);
  }

  return (
    <div className="flex flex-row gap-5 w-full h-[85vh]">
      <Card className="w-1/4 flex flex-col h-full">
        <div className="p-4">
          <h3>{game.game.isRated ? "Rated" : "Unrated"} {timeControlString}</h3>
          <p>{!isDailyGame ? formatDate(game.game.endTime, true) : 0}</p>
          <p>{game.game.resultMessage}</p>
        </div>
        <Separator />
        <ScrollArea className="py-3">
          <div className="grid gap-1 px-4 overflow-y-auto">
            {moves.map((move, index) => {
              if (index % 2 === 0) {
                return (
                  <div key={index} className="select-none grid grid-cols-[40px_1fr_1fr_0.5fr] gap-1 items-center">
                    <p>{Math.floor(index / 2) + 1}.</p>
                    <h4 onClick={() => setCurrentPly(index + 1)} className={`hover:bg-accent cursor-pointer px-2 py-1 ${currentPly === index + 1 ? "bg-accent" : ""}`}>{move}</h4>
                    {moves[index + 1] ?
                      <h4 onClick={() => setCurrentPly(index + 2)} className={`hover:bg-accent cursor-pointer px-2 py-1 ${currentPly === index + 2 ? "bg-accent" : ""}`}>{moves[index + 1]}</h4> :
                      <h4></h4>
                    }
                    <div className="flex flex-col">
                      <p className="text-xs text-end">{index > 0 ? formatTime(moveTimestamps[index - 2] - moveTimestamps[index], false) : formatTime(game.game.baseTime1 - moveTimestamps[0], false)}</p>
                      <p className="text-xs text-end">{index > 0 ? formatTime(moveTimestamps[index - 1] - moveTimestamps[index + 1], false) : formatTime(game.game.baseTime1 - moveTimestamps[1], false)}</p>
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
            <Button variant="secondary" size="icon"><Share size={20} /></Button>
          </div>
        </div>
      </Card>
      <div className={`flex gap-3 h-full ${boardOrientation === "white" ? "flex-col" : "flex-col-reverse"}`}>
        <Card className="flex flex-row items-center justify-between p-2">
          <MiniProfile user={game.players.top} color="black" />
          <ChessClock
            timeLeft={currentPly < 2 ? game.game.baseTime1 : moveTimestamps[Math.floor((currentPly) / 2) * 2 - 1]}
            isToMove={currentPly > 0 && currentPly % 2 === 0}
          />
        </Card>
        <Chessboard position={fen} animationDuration={150} boardOrientation={boardOrientation} boardWidth={boardWidth} />
        <Card className="flex flex-row items-center justify-between p-2">
          <MiniProfile user={game.players.bottom} color="black" />
          <ChessClock
            timeLeft={currentPly < 1 ? game.game.baseTime1 : moveTimestamps[Math.floor((currentPly-1) / 2) * 2]}
            isToMove={currentPly > 0 && currentPly % 2 === 1}
          />
        </Card>
      </div>
      <Card className="flex-grow h-full">Analysis here</Card>
    </div>
  );
};

export default Game;