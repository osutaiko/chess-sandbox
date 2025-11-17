import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GameEndResult } from "common";

type GameEndDialogProps = {
  gameEndResult: GameEndResult | null;
  playerIndex: number | null;
  isOpen: boolean;
  onClose: () => void;
};

const GameEndDialog = ({ gameEndResult, playerIndex, isOpen, onClose }: GameEndDialogProps) => {
  if (!gameEndResult) return null;

  const isWinner = playerIndex !== null && gameEndResult.winners.includes(playerIndex);

  const getTitle = () => {
    if (gameEndResult.winners.length === 0) {
      return "Game Drawn";
    }
    if (isWinner) {
      return "You Won!";
    }
    return "You Lost";
  };

  const getDescription = () => {
    return `by ${gameEndResult.reason}`;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GameEndDialog;
