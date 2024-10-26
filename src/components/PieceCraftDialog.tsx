
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

import { Plus, SquarePen } from "lucide-react";
import { AVAILABLE_SPRITES, EMPTY_PIECE_CONFIG, PIECE_PRESETS } from "@/lib/constants";
import PieceMovesBoard from "./PieceMovesBoard";

const PieceCraftDialog = ({
  isCreateMode,
  variant,
  pieceConfig,
  setPieceConfig,
  pieceConfigErrors,
  setPieceConfigErrors,
  handlePieceInputChange,
  handlePieceConfigSubmit,
  isCreatePieceDialogOpen,
  setIsCreatePieceDialogOpen,
  pieceBeforeEditId,
  openPieceDialogId,
  setOpenPieceDialogId,
}) => {
  const piece = isCreateMode ? pieceConfig : variant.pieces.find((piece) => piece.id === pieceBeforeEditId);
  return (
    <Dialog
      open={isCreateMode ? isCreatePieceDialogOpen : pieceBeforeEditId === openPieceDialogId}
      onOpenChange={(open) => {
        if (isCreateMode) {
          setPieceConfig(EMPTY_PIECE_CONFIG);
          setIsCreatePieceDialogOpen(open);
        } else {
          setOpenPieceDialogId(open ? pieceBeforeEditId : null);
        }
        setPieceConfigErrors({});
      }}
    >
      <DialogTrigger asChild>
      <Button
        size="icon"
        onClick={() => {
          if (!isCreateMode) {
            setPieceConfig(piece);
          }
        }}
      >
        {isCreateMode ? <Plus /> : <SquarePen />}
      </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full w-[1000px] gap-8">
        <DialogHeader>
          <DialogTitle>{isCreateMode ? "Create New Piece" : `Edit Piece`}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[600px]">
          <div className="flex flex-col gap-8">
            {isCreateMode && 
              <div className="flex flex-col gap-4">
                <h4>Presets</h4>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
                  {PIECE_PRESETS.map((piece) => {
                    return (
                      <Button
                        key={piece.id}
                        variant="secondary"
                        className="flex flex-col gap-1 w-full h-min py-2"
                        onClick={() => setPieceConfig(piece)}
                      >
                        <img
                          src={`/src/assets/images/pieces/${piece.sprite}-0.svg`}
                          alt={piece.name}
                          className="w-full"
                        />
                        <p>{piece.name}</p>
                      </Button>
                    );
                  })}
                </div>
              </div>
            }
            <div className="flex flex-col gap-4">
              {isCreateMode && <h4>Piece Configuration</h4>}
              <Label className="flex flex-col gap-2 w-min">
                Sprite
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" className="relative w-[200px] h-[100px] gap-3">
                      {pieceConfig.sprite ? 
                        <>
                          <img
                            src={`/src/assets/images/pieces/${pieceConfig.sprite}-0.svg`}
                            className="w-full h-full"
                          />
                          <img
                            src={`/src/assets/images/pieces/${pieceConfig.sprite}-1.svg`}
                            className="w-full h-full"
                          />
                          <SquarePen className="absolute right-1 bottom-1" />
                        </> : 
                        <Plus />
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full h-[200px]">
                    <ScrollArea className="w-full h-full">
                      <div className="grid grid-cols-4 gap-1">
                        {AVAILABLE_SPRITES.map((sprite) => {
                          return (
                            <Button
                              key={sprite}
                              variant="secondary"
                              className="p-1 h-full gap-2"
                              onClick={() => setPieceConfig({ ...pieceConfig, sprite })}
                            >
                              <img
                                src={`/src/assets/images/pieces/${sprite}-0.svg`}
                                alt={`${sprite}-0}`}
                                className="w-[50px] aspect-square"
                              />
                              <img
                                src={`/src/assets/images/pieces/${sprite}-1.svg`}
                                alt={`${sprite}-1}`}
                                className="w-[50px] aspect-square"
                              />
                            </Button>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                {pieceConfigErrors.sprite && <p className="text-destructive">{pieceConfigErrors.sprite}</p>}
              </Label>
              <div className="flex flex-row gap-2">
                <Label className="flex flex-col gap-2">
                  Name
                  <Input
                    type="text"
                    name="name"
                    placeholder="New Piece"
                    value={pieceConfig.name}
                    onChange={handlePieceInputChange}
                    className="w-[250px]"
                  />
                  {pieceConfigErrors.name && <p className="text-destructive">{pieceConfigErrors.name}</p>}
                </Label>
                <Label className="flex flex-col gap-2">
                  Abbr.
                  <Input
                    type="text"
                    name="id"
                    value={pieceConfig.id}
                    onChange={handlePieceInputChange}
                    className="w-[50px]"
                  />
                  {pieceConfigErrors.id && <p className="text-destructive">{pieceConfigErrors.id}</p>}
                </Label>
              </div>
              <Label className="flex flex-col gap-2">
                Description
                <Textarea
                  name="description"
                  value={pieceConfig.description}
                  onChange={handlePieceInputChange}
                />
                {pieceConfigErrors.description && <p className="text-destructive">{pieceConfigErrors.description}</p>}
              </Label>
              <Label className="flex flex-col gap-2">
                Moves
                <PieceMovesBoard isCraftMode={true} piece={piece} />
              </Label>
              <Label className="flex flex-col gap-2">
                Advanced
              </Label>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => handlePieceConfigSubmit(isCreateMode, pieceBeforeEditId)}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PieceCraftDialog;
