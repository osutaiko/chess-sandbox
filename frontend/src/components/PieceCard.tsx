import { Crown, Trash2 } from "lucide-react";
import { Piece } from "common/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import DraggablePiece from "./DraggablePiece";
import PieceCraftDialog from "./PieceCraftDialog";
import PieceMovesBoard from "./PieceMovesBoard";
import { Variant } from "common/types";

interface PieceCardProps {
  piece: Piece;
  selectedPieceId?: string | null;
  setSelectedPieceId?: (id: string | null) => void;
  selectedPieceColor?: number;
  isRoyal: boolean;
  setVariant?: React.Dispatch<React.SetStateAction<Variant>>;
  variant: Variant;=
  isEditable: boolean;
  pieceConfig: Piece;=
  setPieceConfig?: React.Dispatch<React.SetStateAction<Piece>>;
  pieceConfigErrors?: Record<string, string>;
  setPieceConfigErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handlePieceInputChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handlePieceConfigSubmit?: (isCreateMode: boolean, pieceBeforeEditId: string | null | undefined) => void;
  openPieceDialogId: string | null;=
  setOpenPieceDialogId: React.Dispatch<React.SetStateAction<string | null>>;=
  handlePieceDelete?: (id: string) => void;
  showCrown?: boolean;
  showEditButton?: boolean;
}

export function PieceCard({
  piece,
  selectedPieceId,
  setSelectedPieceId,
  selectedPieceColor = 0, // Default to 0 (white)
  isRoyal,
  setVariant,
  variant,
  isEditable,
  pieceConfig,
  setPieceConfig,
  pieceConfigErrors,
  setPieceConfigErrors,
  handlePieceInputChange,
  handlePieceConfigSubmit,
  openPieceDialogId,
  setOpenPieceDialogId,
  handlePieceDelete,
  showCrown = true,
  showEditButton = true,
}: PieceCardProps) {
  return (
    <Card key={piece.id} className="flex flex-row justify-between gap-4 p-4 items-center bg-secondary">
      <div className="flex flex-col items-center gap-2 w-[120px]">
        <div
          className={`relative ${selectedPieceId === piece.id ? "bg-primary" : ""} rounded-md`}
          onClick={() => {
            if (isEditable && setSelectedPieceId) {
              setSelectedPieceId(selectedPieceId === piece.id ? null : piece.id);
            }
          }}>
          <div className="w-[80px]">
            <DraggablePiece piece={piece} color={selectedPieceColor} row={null} col={null} />
          </div>
          {showCrown && (
            <Crown
              stroke={isRoyal ? "orange" : "gray"}
              fill={isRoyal ? "orange" : "transparent"}
              className={`absolute -top-1 -right-1 ${isEditable && setVariant ? "cursor-pointer" : ""}`}
              onClick={(e) => {
                if (isEditable && setVariant) {
                  e.stopPropagation();
                  setVariant((prev: Variant) => ({
                    ...prev,
                    royals: isRoyal
                      ? prev.royals.filter((id: string) => id !== piece.id)
                      : [...prev.royals, piece.id],
                  }));
                }
              }}
            />
          )}
        </div>
        <div className="flex flex-col gap-2 items-center">
          <Badge className="text-sm aspect-square">{piece.id}</Badge>
          <h4 className="text-center break-all line-clamp-2">{piece.name}</h4>
        </div>
      </div>
      <div className="md:max-w-[250px]">
        <PieceMovesBoard isCraftMode={false} piece={piece} highlightedMoveIndex={null} />
      </div>
      {showEditButton && (
        <div className="flex flex-col gap-1">
          <PieceCraftDialog
            isCreateMode={false}
            variant={variant!}
            pieceConfig={pieceConfig!}
            setPieceConfig={setPieceConfig!}
            pieceConfigErrors={pieceConfigErrors!}
            setPieceConfigErrors={setPieceConfigErrors!}
            handlePieceInputChange={handlePieceInputChange!}
            handlePieceConfigSubmit={(isCreateMode, pieceBeforeEditId) => handlePieceConfigSubmit!(isCreateMode, pieceBeforeEditId)}
            pieceBeforeEditId={piece.id}
            openPieceDialogId={openPieceDialogId}
            setOpenPieceDialogId={setOpenPieceDialogId!}
            isEditable={isEditable}
          />
          {isEditable && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deleting {piece.name}</DialogTitle>
                  <DialogDescription>Are you sure you want to delete this piece?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={() => handlePieceDelete!(piece.id)}>
                      Delete
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </Card>
  );
}
