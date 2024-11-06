import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";

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
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const Create = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [variant, setVariant] = useState<Variant>(structuredClone(DEFAULT_VARIANT)); // Variant after form confirmation
  const [selectedPieceColor, setSelectedPieceColor] = useState<number>(0);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [isCreatePieceDialogOpen, setIsCreatePieceDialogOpen] = useState<boolean>(false);
  const [openPieceDialogId, setOpenPieceDialogId] = useState<string | null>(null);
  const [isGameConfigureDialogOpen, setIsGameConfigureDialogOpen] = useState<boolean>(false);

  const handlePieceDelete = (pieceId: string) => {
    const newVariant = deletePiece(variant, pieceId);
    setVariant(newVariant);
  }

  const ChessboardPanel = () => {
    const [gameConfig, setGameConfig] = useState<Variant>(DEFAULT_VARIANT); // Variant before form confirmation
    const [gameConfigErrors, setGameConfigErrors] = useState<VariantErrors>({});

    const handleGameInputChange = (e: any) => {
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

    const handleGameConfigSubmit = () => {
      const errors: VariantErrors = {};
  
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
        setIsGameConfigureDialogOpen(false);
      }
    };

    return (
      <>
        <ScrollArea className="flex flex-col items-center">
          <Chessboard variant={variant} isInteractable={true} setVariant={setVariant} selectedPieceId={selectedPieceId} selectedPieceColor={selectedPieceColor} />
        </ScrollArea>
        <Dialog open={isGameConfigureDialogOpen} onOpenChange={(open) => setIsGameConfigureDialogOpen(open)}>
          <DialogTrigger asChild className="w-full">
            <Button onClick={() => setIsGameConfigureDialogOpen(true)}>
              Configure Variant
            </Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col flex-none gap-4 md:gap-8">
            <DialogHeader>
              <DialogTitle>Variant Configuration</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[70vh]">
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
                <div className="flex flex-row gap-2">
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
                <div className="flex flex-col gap-2">
                  <h4>Win Conditions</h4>
                  {variant.royals.length > 0 && 
                    <>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isWinOnCheckmate"
                          name="isWinOnCheckmate"
                          checked={gameConfig.isWinOnCheckmate}
                          onCheckedChange={(checked: boolean) => handleGameCheckedChange("isWinOnCheckmate", checked)}
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
                      onCheckedChange={(checked: boolean) => handleGameCheckedChange("isWinOnStalemate", checked)}
                    />
                    <Label htmlFor="isWinOnStalemate">Stalemate the opponent</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isWinOnOpponentWipe"
                      name="isWinOnOpponentWipe"
                      checked={gameConfig.isWinOnOpponentWipe}
                      onCheckedChange={(checked: boolean) => handleGameCheckedChange("isWinOnOpponentWipe", checked)}
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
                      onCheckedChange={(checked: boolean) => handleGameCheckedChange("isWinOnStalemate", !checked)}
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
                        onValueChange={(value: string[]) => {
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
          </DialogContent>
        </Dialog>
      </>
    );
  };
  
  const PiecesPanel: React.FC<{
    openPieceDialogId: string | null;
    setOpenPieceDialogId: React.Dispatch<React.SetStateAction<string | null>>;
  }> = ({ openPieceDialogId, setOpenPieceDialogId }) => {
    const [pieceConfig, setPieceConfig] = useState<Piece>(variant.pieces.find((piece) => openPieceDialogId === piece.id) || EMPTY_PIECE_CONFIG);
    const [pieceConfigErrors, setPieceConfigErrors] = useState<PieceErrors>({});
    
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
  
    const handlePieceConfigSubmit = (isCreateMode: boolean, pieceBeforeEditId: string | null | undefined) => {
      const errors: PieceErrors = {};
  
      if (!pieceConfig.id) {
        errors.id = "One-letter piece abbreviation is required.";
      }
      if (!pieceConfig.name) {
        errors.name = "Piece name is required.";
      }
      if (!pieceConfig.sprite) {
        errors.sprite = "Please select a sprite for your piece.";
      }
  
      if (isCreateMode) {
        // Checks only in create mode
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
    };

    return (
      <>
        <div className="flex flex-row justify-between gap-1 items-center px-2 md:px-0">
          <Tabs
            defaultValue="0"
            value={String(selectedPieceColor)}
            onValueChange={(value) => setSelectedPieceColor(parseInt(value))}
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
          <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(310px,1fr))] px-2 md:px-0 pb-8 md:pb-0">
            {variant.pieces.map((piece) => {
              const isRoyal = variant.royals.includes(piece.id);
              return (
                <Card key={piece.id} className="flex flex-row justify-between gap-4 p-4 items-center bg-secondary">
                  <div className="flex flex-col items-center gap-2 w-[120px]">
                    <div
                      className={`relative ${selectedPieceId === piece.id ? "bg-primary" : ""} rounded-md`}
                      onClick={() => {
                        setSelectedPieceId(selectedPieceId === piece.id ? null : piece.id);
                      }}>
                      <div className="w-[80px]">
                        <DraggablePiece piece={piece} color={selectedPieceColor} row={null} col={null} />
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
                    <Badge className="text-sm aspect-square">{piece.id}</Badge>
                      <h4 className="text-center break-all line-clamp-2">
                      {piece.name}
                      </h4>
                    </div>
                  </div>
                  <div className="md:max-w-[250px]">
                    <PieceMovesBoard isCraftMode={false} piece={piece} highlightedMoveIndex={null} />
                  </div>
                  <div className="flex flex-col gap-1">
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
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </>
    );
  };

  if (isDesktop) {
    return (
      <ResizablePanelGroup direction="horizontal" className="flex flex-row px-8 py-6 gap-6 w-full">
        <ResizablePanel minSize={20} className="flex flex-col gap-2 w-full h-[calc(100vh-110px)]">
          <ChessboardPanel />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={20} className="flex flex-col gap-2 w-full h-[calc(100vh-110px)]">
          <PiecesPanel openPieceDialogId={openPieceDialogId} setOpenPieceDialogId={setOpenPieceDialogId} />
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  } else {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex flex-col items-center gap-2 max-h-[80vh]">
          <ChessboardPanel />
        </div>
        <Separator />
        <div className="flex flex-col gap-2 w-full">
          <PiecesPanel openPieceDialogId={openPieceDialogId} setOpenPieceDialogId={setOpenPieceDialogId} />
        </div>
      </div>
    );
  }
};

export default Create;
