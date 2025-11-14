import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { DEFAULT_VARIANT, EMPTY_PIECE_CONFIG } from "@/lib/constants";
import { deletePiece, resizeBoard, Piece, PieceErrors, Variant, VariantErrors } from "common";

import Chessboard from "@/components/Chessboard";
import PieceCraftDialog from "@/components/PieceCraftDialog";
import { PieceCard } from "@/components/PieceCard";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const Browse = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const variantId = searchParams.get('variantId');

  const [variants, setVariants] = useState<Variant[]>([]);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (variantId) {
          const response = await fetch(`http://localhost:3001/api/variants/${variantId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: Variant = await response.json();
          setVariant(data);
        } else {
          const response = await fetch('http://localhost:3001/api/variants');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: Variant[] = await response.json();
          setVariants(data);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to fetch variants');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVariants();
  }, [variantId]);


  const [isGameConfigureDialogOpen, setIsGameConfigureDialogOpen] = useState<boolean>(false);

  const [selectedSide, setSelectedSide] = useState<number>(-1); // -1 for random, 0 for White, 1 for Black

  const createGame = async (variantToPlay: Variant, preferredSide: number) => {
    try {
      const response = await fetch('http://localhost:3001/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variant: variantToPlay, preferredSide }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { roomId } = await response.json();
      navigate(`/play?roomId=${roomId}`);
    } catch (err: any) {
      console.error('Error creating game:', err);
      setError(err.message || "Failed to create game.");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-full text-destructive">Error: {error}</div>;
  }

  const ChessboardPanel = () => {
    const [gameConfig, setGameConfig] = useState<Variant>(variant!); // Use current variant as initial config
  
    return (
      <>
        <ScrollArea className="flex flex-col items-center">
          <Chessboard variant={variant!} isInteractable={false} />
        </ScrollArea>
        <div className="flex flex-row gap-1 w-full px-2 md:px-0">
          <Dialog open={isGameConfigureDialogOpen} onOpenChange={(open) => setIsGameConfigureDialogOpen(open)}>
            <DialogTrigger asChild className="w-full">
              <Button onClick={() => setIsGameConfigureDialogOpen(true)}>
                Details
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
                      disabled
                    />
                  </Label>
                  <Label className="flex flex-col gap-2">
                    <h4>Description</h4>
                    <Textarea
                      name="description"
                      value={gameConfig.description}
                      disabled
                    />
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
                        disabled
                      />
                    </Label>
                    <Label className="flex flex-col gap-2 w-full">
                      <h4>Height (# of Ranks)</h4>
                      <Input
                        type="number"
                        name="height"
                        min={1}
                        max={25}
                        value={gameConfig.height}
                        disabled
                      />
                    </Label>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4>Win Conditions</h4>
                    {variant!.royals.length > 0 && 
                      <>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="isWinOnCheckmate"
                            name="isWinOnCheckmate"
                            checked={gameConfig.isWinOnCheckmate}
                            disabled
                          />
                          <Label htmlFor="isWinOnCheckmate">Checkmate the opponent</Label>
                        </div>
                        <RadioGroup
                          value={String(gameConfig.mustCheckmateAllRoyals)}
                          disabled
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
                        disabled
                      />
                      <Label htmlFor="isWinOnStalemate">Stalemate the opponent</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isWinOnOpponentWipe"
                        name="isWinOnOpponentWipe"
                        checked={gameConfig.isWinOnOpponentWipe}
                        disabled
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
                        disabled
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
                          disabled
                          className="w-[100px]"
                        />
                        <Label htmlFor="nMoveRulePieces">... resets after one of the following moves:</Label>
                        <ToggleGroup
                          type="multiple" 
                          variant="outline" 
                          value={gameConfig.nMoveRulePieces}
                          disabled
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
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">Play!</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Choose Your Side</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center gap-4">
                <Button onClick={() => createGame(variant!, 0)}>White</Button>
                <Button onClick={() => createGame(variant!, 1)}>Black</Button>
                <Button onClick={() => createGame(variant!, -1)}>Random</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </>
    );
  };
  
  const PiecesPanel: React.FC<{
  }> = () => {
    const [openPieceDialogId, setOpenPieceDialogId] = useState<string | null>(null);

    return (
      <>
        <ScrollArea>
          <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(310px,1fr))] px-2 md:px-0 pb-8 md:pb-0">
            {variant!.pieces.map((piece) => {
              const isRoyal = variant!.royals.includes(piece.id);
              return (
                <PieceCard
                  key={piece.id}
                  piece={piece}
                  isRoyal={isRoyal}
                  isEditable={false}
                  showCrown={true}
                  showEditButton={true}
                  variant={variant!}
                  setVariant={() => {}}
                  selectedPieceColor={0}
                  selectedPieceId={null}
                  setSelectedPieceId={() => {}}
                  pieceConfig={piece}
                  setPieceConfig={() => {}}
                  pieceConfigErrors={{}}
                  setPieceConfigErrors={() => {}}
                  handlePieceInputChange={() => {}}
                  handlePieceConfigSubmit={() => {}}
                  openPieceDialogId={openPieceDialogId}
                  setOpenPieceDialogId={setOpenPieceDialogId}
                  handlePieceDelete={() => {}}
                />
              );
            })}
          </div>
        </ScrollArea>
      </>
    );
  };

  if (variantId) { // Detail view
    if (!variant) {
      return <div>Variant not found</div>;
    }
    if (isDesktop) {
      return (
        <ResizablePanelGroup direction="horizontal" className="flex flex-row px-8 py-6 gap-6 w-full">
          <ResizablePanel minSize={20} className="flex flex-col gap-2 w-full h-[calc(100vh-110px)]">
            <ChessboardPanel />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel minSize={20} className="flex flex-col gap-2 w-full h-[calc(100vh-110px)]">
            <PiecesPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      );
    } else {
      return (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex flex-col items-center gap-2 max-h-[80vh]">
            <ChessboardPanel />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <PiecesPanel />
          </div>
        </div>
      );
    }
  } else { // List view
    return (
      <div className="p-4 w-full">
        {variants.length === 0 ? (
          <p>No variants available. Create one!</p>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {variants.map((variant) => (
              <div key={variant.id} className="p-4 transition-shadow cursor-pointer flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-2 text-center truncate w-[300px]">{variant.name}</h2>
                <Link to={`/browse?variantId=${variant.id}`}>
                  <div className="w-[300px] h-[300px] flex items-center justify-center">
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ maxWidth: '100%', maxHeight: '100%', aspectRatio: `${variant.width} / ${variant.height}` }}>
                        <Chessboard variant={variant} isInteractable={false} showLabels={false} />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
};

export default Browse;