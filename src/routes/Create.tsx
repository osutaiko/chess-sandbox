import { useState } from "react";

import { DEFAULT_VARIANT, EMPTY_PIECE_CONFIG } from "@/lib/constants";
import { deletePiece, resizeBoard } from "@/lib/chess";
import { Piece, PieceErrors, Variant, VariantErrors } from "@/lib/types";

import Chessboard from "@/components/Chessboard";
import PieceMovesBoard from "@/components/PieceMovesBoard";
import DraggablePiece from "@/components/DraggablePiece";
import PieceCraftDialog from "@/components/PieceCraftDialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

import { Crown, Trash2 } from "lucide-react";

const Create = () => {
  const [gameConfig, setGameConfig] = useState<Variant>(DEFAULT_VARIANT); // Variant before form confirmation
  const [gameConfigErrors, setGameConfigErrors] = useState<VariantErrors>({});
  const [variant, setVariant] = useState<Variant>(DEFAULT_VARIANT); // Variant after form confirmation
  const [selectedPieceColor, setSelectedPieceColor] = useState<number>(0);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [pieceConfig, setPieceConfig] = useState<Piece>(EMPTY_PIECE_CONFIG);
  const [pieceConfigErrors, setPieceConfigErrors] = useState<PieceErrors>({});
  const [isCreatePieceDialogOpen, setIsCreatePieceDialogOpen] = useState<boolean>(false);
  const [openPieceDialogId, setOpenPieceDialogId] = useState<string | null>(null);

  const handleGameInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = (name === "width" || name === "height") ? parseInt(value) : value;
  
    setGameConfig((prevConfig) => ({
      ...prevConfig,
      [name]: newValue,
    }));
  };

  const handleGameCheckedChange = (name: string, checked: boolean) => {
    setGameConfig((prevConfig) => ({
      ...prevConfig,
      [name]: checked,
    }));
  };

  const handlePieceInputChange = (e: any) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === "id") {
      const lastChar = newValue[newValue.length - 1];
      const isAlphabet = /^[A-Za-z]*$/.test(lastChar);
      newValue = isAlphabet ? lastChar.toUpperCase() : "";
    }
  
    setPieceConfig((prevConfig) => ({
      ...prevConfig,
      [name]: newValue,
    }));
  };

  const handleGameConfigSubmit = () => {
    const errors = {};

    if (!gameConfig.name) {
        errors.name = "Variant name is required.";
    }
    if (!(1 <= gameConfig.width && gameConfig.width <= 25)) {
        errors.width = "Width must be between 1 and 25.";
    }
    if (!(2 <= gameConfig.height && gameConfig.height <= 25)) {
        errors.height = "Height must be between 2 and 25.";
    }
    setGameConfigErrors(errors);

    if (Object.keys(errors).length === 0) {
      const newVariant = resizeBoard(gameConfig);
      setVariant(newVariant);
      setGameConfig(newVariant);
    }
  };

  const handlePieceConfigSubmit = (isCreateMode, pieceBeforeEditId) => {
    const errors = {};

    if (!pieceConfig.id) {
      errors.id = "One-letter piece abbreviation is required.";
    }
    if (!pieceConfig.name) {
      errors.name = "Piece name is required.";
    }
    if (!pieceConfig.sprite) {
      errors.sprite = "Please select a sprite for your piece.";
    }

    if (isCreateMode) { // Checks only on create mode
      variant.pieces.forEach((piece) => {
        if (piece.id === pieceConfig.id) {
          errors.id = "There is already another piece with this one-letter abbreviation.";
        }
        if (piece.name === pieceConfig.name) {
          errors.name = "There is already another piece with this name.";
        }
        if (piece.sprite === pieceConfig.sprite) {
          errors.sprite = "There is already another piece using this sprite.";
        }
      })
    } else { // Checks only on edit mode
      variant.pieces.forEach((piece) => {
        if (piece.id === pieceConfig.id && piece.id !== pieceBeforeEditId) {
          errors.id = "There is already another piece with this one-letter abbreviation.";
        }
        if (piece.name === pieceConfig.name && piece.id !== pieceBeforeEditId) {
          errors.name = "There is already another piece with this name.";
        }
        if (piece.sprite === pieceConfig.sprite && piece.id !== pieceBeforeEditId) {
          errors.sprite = "There is already another piece using this sprite.";
        }
      })
    }
    setPieceConfigErrors(errors);

    if (Object.keys(errors).length === 0) {
      if (isCreateMode) {
        setVariant({ ...variant, pieces: [...variant.pieces, pieceConfig] });
        setIsCreatePieceDialogOpen(false);
      } else {
        const updatedPieces = variant.pieces.map((piece) => 
          piece.id === pieceBeforeEditId ? pieceConfig : piece
        );
        setVariant({ ...variant, pieces: updatedPieces });
        setOpenPieceDialogId(null);
      }
      setPieceConfig(EMPTY_PIECE_CONFIG);
    }
  }

  const handlePieceDelete = (pieceId) => {
    const newVariant = deletePiece(variant, pieceId);
    setVariant(newVariant);
  }

  return (
    <div className="flex flex-row divide-x p-8 h-[calc(100vh-72px)]">
      <div className="flex flex-col flex-none gap-8 w-[300px] h-full pr-8">
        <h3>Game Configuration</h3>
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-6">
            <Label className="flex flex-col gap-2">
              <h4>Variant Name</h4>
              <Input
                type="text"
                name="name"
                placeholder="New Variant"
                value={gameConfig.name}
                onChange={handleGameInputChange}
              />
              {gameConfigErrors.name && <p className="text-destructive">{gameConfigErrors.name}</p>}
            </Label>
            <Label className="flex flex-col gap-2">
              <h4>Description</h4>
              <Textarea
                name="description"
                value={gameConfig.description}
                onChange={handleGameInputChange}
              />
              {gameConfigErrors.description && <p className="text-destructive">{gameConfigErrors.description}</p>}
            </Label>
            <div className="flex flex-row gap-4">
              <Label className="flex flex-col gap-2 w-full">
                <h4>Width (# of Files)</h4>
                <Input
                  type="number"
                  name="width"
                  value={gameConfig.width}
                  min={1}
                  max={25}
                  onChange={handleGameInputChange}
                />
                {gameConfigErrors.width && <p className="text-destructive">{gameConfigErrors.width}</p>}
              </Label>
              <Label className="flex flex-col gap-2 w-full">
                <h4>Height (# of Ranks)</h4>
                <Input
                  type="number"
                  name="height"
                  min={1}
                  max={25}
                  value={gameConfig.height}
                  onChange={handleGameInputChange}
                />
                {gameConfigErrors.height && <p className="text-destructive">{gameConfigErrors.height}</p>}
              </Label>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <h4>Win Conditions</h4>
              {variant.royals.length > 0 && 
                <>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isWinOnCheckmate"
                      name="isWinOnCheckmate"
                      checked={gameConfig.isWinOnCheckmate}
                      onCheckedChange={(checked) => handleGameCheckedChange("isWinOnCheckmate", checked)}
                    />
                    <Label htmlFor="isWinOnCheckmate">Checkmate the opponent</Label>
                  </div>
                  <RadioGroup
                    value={String(gameConfig.mustCheckmateAllRoyals)}
                    onValueChange={(value) => handleGameCheckedChange("mustCheckmateAllRoyals", value === "true")}
                    className="ml-6 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false">... One of the royals</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true">... the final remaining royal</Label>
                    </div>
                  </RadioGroup>
                </>
              }
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isWinOnStalemate"
                  name="isWinOnStalemate"
                  checked={gameConfig.isWinOnStalemate}
                  onCheckedChange={(checked) => handleGameCheckedChange("isWinOnStalemate", checked)}
                />
                <Label htmlFor="isWinOnStalemate">Stalemate the opponent</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isWinOnOpponentWipe"
                  name="isWinOnOpponentWipe"
                  checked={gameConfig.isWinOnOpponentWipe}
                  onCheckedChange={(checked) => handleGameCheckedChange("isWinOnOpponentWipe", checked)}
                />
                <Label htmlFor="isWinOnOpponentWipe">Capture all opponent's pieces</Label>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h4>Draw Conditions</h4>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isDrawOnStalemate"
                  name="isDrawOnStalemate"
                  checked={!gameConfig.isWinOnStalemate}
                  onCheckedChange={(checked) => handleGameCheckedChange("isWinOnStalemate", !checked)}
                />
                <Label htmlFor="isDrawOnStalemate">Stalemate the opponent</Label>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox checked={true} disabled={true} />
                  <Label className="!cursor-default !opacity-100">N-move rule</Label>
                </div>
                <div className="flex flex-col gap-2 ml-6">
                  <Label htmlFor="nMoveRuleCount">... on move:</Label>
                  <Input
                    type="number"
                    name="nMoveRuleCount"
                    value={gameConfig.nMoveRuleCount}
                    onChange={handleGameInputChange}
                    className="w-[100px]"
                  />
                  <Label htmlFor="nMoveRulePieces">... resets after one of the following moves:</Label>
                  <ToggleGroup
                    type="multiple" 
                    variant="outline" 
                    value={gameConfig.nMoveRulePieces}
                    onValueChange={(value) => {
                      setGameConfig((prev) => ({
                        ...prev,
                        nMoveRulePieces: value,
                      }));
                    }}
                    className="grid grid-cols-[repeat(auto-fit,minmax(36px,1fr))] gap-1 justify-items-start"
                  >
                    {gameConfig.pieces.map((piece) => (
                      <ToggleGroupItem
                        key={piece.id}
                        value={piece.id}
                        className="w-full h-[36px] flex items-center justify-center"
                      >
                        {piece.id}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <Button onClick={handleGameConfigSubmit}>Apply</Button>
      </div>

      <ScrollArea className="w-full">
        <div className="flex flex-col px-8">
          <Chessboard variant={variant} setVariant={setVariant} selectedPieceId={selectedPieceId} selectedPieceColor={selectedPieceColor} />
        </div>
      </ScrollArea>

      <div className="flex flex-col gap-4 flex-none pl-8">
        <h3>Pieces</h3>
        <div className="flex flex-row justify-between">
          <Tabs
            defaultValue="0"
            onValueChange={(value) =>setSelectedPieceColor(parseInt(value))}
          >
            <TabsList>
              <TabsTrigger value="0">White</TabsTrigger>
              <TabsTrigger value="1">Black</TabsTrigger>
            </TabsList>
          </Tabs>
          <PieceCraftDialog
            isCreateMode={true}
            variant={variant}
            pieceConfig={pieceConfig}
            setPieceConfig={setPieceConfig}
            pieceConfigErrors={pieceConfigErrors}
            setPieceConfigErrors={setPieceConfigErrors}
            handlePieceInputChange={handlePieceInputChange}
            handlePieceConfigSubmit={handlePieceConfigSubmit}
            isCreatePieceDialogOpen={isCreatePieceDialogOpen}
            setIsCreatePieceDialogOpen={setIsCreatePieceDialogOpen}
          />
        </div>
        <ScrollArea>
          <div className="flex flex-col gap-4">
            {variant.pieces.map((piece) => {
              const isRoyal = variant.royals.includes(piece.id);
              return (
                <Card key={piece.id} className="bg-secondary">
                  <div className="flex flex-row items-center">
                    <div className="flex flex-col items-center gap-2 p-4 w-[130px]">
                      <div
                        className={`relative ${selectedPieceId === piece.id ? "bg-primary" : ""} rounded-md`}
                        onClick={() => {
                          setSelectedPieceId(selectedPieceId === piece.id ? null : piece.id);
                        }}>
                        <div className="w-[80px]">
                          <DraggablePiece piece={piece} color={selectedPieceColor} row={undefined} col={undefined} />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-3 -right-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVariant((prev) => ({
                              ...prev,
                              royals: isRoyal
                                ? prev.royals.filter((id) => id !== piece.id)
                                : [...prev.royals, piece.id],
                            }));
                          }}
                        >
                          <Crown
                            stroke={isRoyal ? "orange" : "gray"}
                            fill={isRoyal ? "orange" : "transparent"}
                          />
                        </Button>
                      </div>
                      <div className="flex flex-col gap-2 items-center">
                      <Badge className="text-base">{piece.id}</Badge>
                        <h4 className="text-center break-all line-clamp-2">
                        {piece.name}
                        </h4>
                      </div>
                    </div>
                    <div className="py-4">
                      <PieceMovesBoard isCraftMode={false} piece={piece} />
                    </div>
                    <div className="flex flex-col gap-1 p-4">
                      <PieceCraftDialog
                        isCreateMode={false}
                        variant={variant}
                        pieceConfig={pieceConfig}
                        setPieceConfig={setPieceConfig}
                        pieceConfigErrors={pieceConfigErrors}
                        setPieceConfigErrors={setPieceConfigErrors}
                        handlePieceInputChange={handlePieceInputChange}
                        handlePieceConfigSubmit={handlePieceConfigSubmit}
                        pieceBeforeEditId={piece.id}
                        openPieceDialogId={openPieceDialogId}
                        setOpenPieceDialogId={setOpenPieceDialogId}
                      />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Deleting {piece.name}</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this piece?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="destructive" onClick={() => handlePieceDelete(piece.id)}>
                                Delete
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Create;
