import { useEffect, useState } from "react";

import { Variant } from "@/lib/types";
import { addPieceToBoard } from "@/lib/chess";
import { PIECE_PRESETS } from "@/lib/piecePresets";
import { DEFAULT_VARIANT } from "@/lib/constants";

import Chessboard from "@/components/Chessboard";

const Home = () => {
  // Workaround to avoid mutating DEFAULT_VARIANT
  const [variant, setVariant] = useState<Variant>({ ...structuredClone(DEFAULT_VARIANT), pieces: PIECE_PRESETS });

  useEffect(() => {
    const attemptPlacement = () => {
      setVariant((prevVariant) => {
        const updatedVariant = { ...prevVariant };
        const piece = updatedVariant.pieces[Math.floor(Math.random() * updatedVariant.pieces.length)];
        
        if (piece.id === 'K' || piece.id === 'P') {
          attemptPlacement();
          return prevVariant;
        }
  
        const colIndex = Math.floor(Math.random() * updatedVariant.width);
  
        if (prevVariant.board[0][colIndex].pieceId === 'K') {
          attemptPlacement();
          return prevVariant;
        }
  
        const updatedBoard = addPieceToBoard(updatedVariant, piece.id, 1, 0, colIndex);
  
        const mirroredRow = updatedVariant.height - 1;
        const finalVariant = addPieceToBoard(updatedBoard, piece.id, 0, mirroredRow, colIndex);
        return finalVariant;
      });
    };
  
    const interval = setInterval(attemptPlacement, 500);
  
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6 md:gap-12 items-center md:px-8 py-6 md:py-12 w-full">
      <div className="flex flex-col items-center gap-2 md:gap-4">
        <h2 className="text-base sm:text-xl md:text-2xl">Welcome to Chess Sandbox</h2>
        <p className="px-4 text-center">Create, browse, and play user-made fairy chess variants</p>
      </div>

      <div className="max-w-[500px] aspect-square md:max-w-full w-full md:w-1/2">
        <Chessboard variant={variant} isInteractable={false} />
      </div>
    </div>
  );
};

export default Home;
