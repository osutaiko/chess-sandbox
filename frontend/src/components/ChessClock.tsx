import React, { useEffect, useState } from 'react';

interface ChessClockProps {
  initialTime: number; // Time in milliseconds
  isRunning: boolean;
  onTimeUp: () => void;
  onTimeUpdate?: (timeLeft: number) => void;
  playerColor: number;
  currentTurn: number;
  increment: number; // Increment in seconds
}

const ChessClock: React.FC<ChessClockProps> = ({
  initialTime,
  isRunning,
  onTimeUp,
  onTimeUpdate,
  playerColor,
  currentTurn,
  increment,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && playerColor === currentTurn) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1000;
          if (onTimeUpdate) {
            onTimeUpdate(newTime); // Report time left
          }
          if (newTime <= 0) {
            clearInterval(timer);
            onTimeUp();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, playerColor, currentTurn, onTimeUp, onTimeUpdate]);

  const formatTime = (time: number) => {
    const totalSeconds = Math.floor(time / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const textColorClass = timeLeft <= 30000 && timeLeft > 0 ? 'text-red-500' : 'text-white'; // Less than 30 seconds, not 0

  return (
    <p className={`text-3xl text-center ${textColorClass}`}>
      {formatTime(timeLeft)}
    </p>
  );
};

export default ChessClock;