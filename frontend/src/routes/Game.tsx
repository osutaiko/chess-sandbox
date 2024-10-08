import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Chess, DEFAULT_POSITION } from "chess.js";
import { Chessboard } from "react-chessboard";

import GameNavigationInterface from "@/components/GameNavigationInterface";
import GameAnalysisInterface from "@/components/GameAnalysisInterface";
import GameReportInterface from "@/components/GameReportInterface";
import MiniProfile from "@/components/MiniProfile";
import ChessClock from "@/components/ChessClock";

import { Card } from "@/components/ui/card";

import moveSoundFile from "@/assets/sounds/chess-move.mp3";
import captureSoundFile from "@/assets/sounds/chess-capture.mp3";

const Game = () => {
  const [searchParams] = useSearchParams();
  const urlParam = searchParams.get("url");
  const pgnParam = searchParams.get("pgn");

  const [boardWidth, setBoardWidth] = useState(400);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moveAnalyses, setMoveAnalyses] = useState(null);
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [currentPly, setCurrentPly] = useState(0);
  const [fen, setFen] = useState(DEFAULT_POSITION);
  const [reportStatus, setReportStatus] = useState("idle");

  const chessRef = useRef(new Chess());
  const chessboardContainerRef = useRef(null);

  const moveSound = useRef(null);
  const captureSound = useRef(null);

  const fetchGame = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (urlParam) {
        response = await fetch(`http://localhost:3000/api/game?url=${encodeURIComponent(urlParam)}`);
      } else if (pgnParam) {
        response = await fetch(`http://localhost:3000/api/game?pgn=${encodeURIComponent(pgnParam)}`);
      }
      
      if (!response.ok) {
        throw new Error(response.status === 404 ? 'Game not found' : 'An error occurred');
      }

      const data = await response.json();
      setGame(data);
    } catch (e) {
      setError(e.message);
      setGame(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlParam || pgnParam) {
      fetchGame();
    }
  }, [urlParam, pgnParam]);

  useEffect(() => {
    moveSound.current = new Audio(moveSoundFile);
    captureSound.current = new Audio(captureSoundFile);
  
    return () => {
      moveSound.current = null;
      captureSound.current = null;
    };
  }, []);

  const playMoveSound = (move) => {
    const audio = move.includes("x") ? captureSound.current : moveSound.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
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

  useEffect(() => {
    const chess = chessRef.current;
    chess.reset();

    for (let i = 0; i < currentPly; i++) {
      chess.move(game.moves[i]);
    }

    setFen(chess.fen());
    if (currentPly > 0) playMoveSound(game.moves[currentPly - 1]);
  }, [currentPly]);

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
        if (currentPly < game.moves.length) setCurrentPly(currentPly + 1);
        break;
      case 'start':
        setCurrentPly(0);
        break;
      case 'end':
        setCurrentPly(game.moves.length);
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    const chessboardElement = chessboardContainerRef.current;

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

    const handleWheel = (event) => {
      event.preventDefault();
      const delta = event.deltaY;

      if (delta > 0) {
          handlePlyNavigation("right");
      } 
      else if (delta < 0) {
          handlePlyNavigation("left");
      }
    }
  
    window.addEventListener("keydown", handleKeyDown);
    if (chessboardElement) {
      chessboardElement.addEventListener("wheel", handleWheel);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (chessboardElement) {
        chessboardElement.removeEventListener("wheel", handleWheel);
      }
    };
  }, [game, currentPly]);

  if (loading) {
    return <h4>Loading...</h4>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!game) {
    return <h2>No game data available</h2>;
  }

  return (
    <div className="flex flex-row select-none gap-5 w-full h-[85vh]">
      <GameNavigationInterface
        game={game}
        moveAnalyses={moveAnalyses}
        currentPly={currentPly}
        setCurrentPly={setCurrentPly}
        handlePlyNavigation={handlePlyNavigation}
        handleFlipBoardOrientation={handleFlipBoardOrientation}
        reportStatus={reportStatus}
      />
      <div className={`flex gap-3 h-full ${boardOrientation === "white" ? "flex-col" : "flex-col-reverse"}`}>
        <Card className="flex flex-row items-center justify-between p-2">
          <MiniProfile player={game.players.black} color="black" fen={fen} />
          {game.isLiveGame && game.timeControl &&
            <ChessClock
              timeLeft={currentPly < 2 ? game.timeControl.base : game.timestamps[Math.floor((currentPly) / 2) * 2 - 1]}
              isToMove={currentPly > 0 && currentPly % 2 === 0}
            />
          }
        </Card>
        <div ref={chessboardContainerRef} className="rounded-md overflow-hidden">
          <Chessboard position={fen} animationDuration={150} boardOrientation={boardOrientation} boardWidth={boardWidth} arePiecesDraggable={false} />
        </div>
        <Card className="flex flex-row items-center justify-between p-2">
          <MiniProfile player={game.players.white} color="white" fen={fen} />
          {game.isLiveGame && 
            <ChessClock
              timeLeft={currentPly < 1 ? game.timeControl.base : game.timestamps[Math.floor((currentPly - 1) / 2) * 2]}
              isToMove={currentPly > 0 && currentPly % 2 === 1}
            />
          }
        </Card>
      </div>
      <div className="flex flex-col gap-4 w-full h-full">
        <GameAnalysisInterface
          fen={fen}
          currentPly={currentPly}
          reportStatus={reportStatus}
          moveAnalyses={moveAnalyses}
        />
        <GameReportInterface
          game={game}
          currentPly={currentPly}
          setCurrentPly={setCurrentPly}
          reportStatus={reportStatus}
          setReportStatus={setReportStatus}
          moveAnalyses={moveAnalyses}
          setMoveAnalyses={setMoveAnalyses}
        />
      </div>
    </div>
  );
};

export default Game;