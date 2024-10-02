import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Chess, DEFAULT_POSITION } from "chess.js";
import { Chessboard } from "react-chessboard";

import { tcnToAlgebraics } from "@/lib/utils";

import GameNavigationInterface from "@/components/GameNavigationInterface";
import AnalysisInterface from "@/components/AnalysisInterface";
import GameReviewInterface from "@/components/GameReviewInterface";
import MiniProfile from "@/components/MiniProfile";
import ChessClock from "@/components/ChessClock";

import { Card } from "@/components/ui/card";

import moveSoundFile from "@/assets/sounds/chess-move.mp3";
import captureSoundFile from "@/assets/sounds/chess-capture.mp3";

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
  let moveTimestamps = [];
  // Checks for daily game
  if (isDailyGame) {
    moveTimestamps = game.game.timestamps;
  } else {
    moveTimestamps = game.game.moveTimestamps.split(',').map(Number);
  }

  return (
    <div className="flex flex-row gap-5 w-full h-[85vh]">
      <GameNavigationInterface
        game={game.game}
        moves={moves}
        moveTimestamps={moveTimestamps}
        currentPly={currentPly}
        setCurrentPly={setCurrentPly}
        isDailyGame={isDailyGame}
        handlePlyNavigation={handlePlyNavigation}
        handleFlipBoardOrientation={handleFlipBoardOrientation}
      />
      <div ref={chessboardContainerRef} className={`flex gap-3 h-full ${boardOrientation === "white" ? "flex-col" : "flex-col-reverse"}`}>
        <Card className="flex flex-row items-center justify-between p-2">
          <MiniProfile user={game.players.top} ratingChange={game.game.ratingChangeBlack} fen={fen} />
          <ChessClock
            timeLeft={currentPly < 2 ? game.game.baseTime1 : moveTimestamps[Math.floor((currentPly) / 2) * 2 - 1]}
            isToMove={currentPly > 0 && currentPly % 2 === 0}
          />
        </Card>
        <Chessboard position={fen} animationDuration={150} boardOrientation={boardOrientation} boardWidth={boardWidth} />
        <Card className="flex flex-row items-center justify-between p-2">
          <MiniProfile user={game.players.bottom} ratingChange={game.game.ratingChangeWhite} fen={fen} />
          <ChessClock
            timeLeft={currentPly < 1 ? game.game.baseTime1 : moveTimestamps[Math.floor((currentPly-1) / 2) * 2]}
            isToMove={currentPly > 0 && currentPly % 2 === 1}
          />
        </Card>
      </div>
      <div className="flex flex-col gap-4 w-1/3">
        <AnalysisInterface fen={fen} currentPly={currentPly} />
        <GameReviewInterface moves={moves} />
      </div>
    </div>
  );
};

export default Game;