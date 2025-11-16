import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useNavigate, useParams } from "react-router-dom";
import { VARIANT_PRESETS } from "@/lib/variantPresets";

import { Variant } from "common";
import { parse, stringify } from "common/json";

import Chessboard from "@/components/Chessboard";
import { PieceCard } from "@/components/PieceCard";
import VariantConfigDialog from "@/components/VariantConfigDialog";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import images from "@/assets/images";

const BrowseVariantInfo = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();
  const { variantId } = useParams<{ variantId: string }>();

  const [variant, setVariant] = useState<Variant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeControl, setSelectedTimeControl] = useState<string>("5+0"); // Default time control
  const [selectedSide, setSelectedSide] = useState<number>(0);

  useEffect(() => {
    const fetchVariant = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (variantId) {
          const officialVariant = VARIANT_PRESETS.find(v => v.id === variantId);
          if (officialVariant) {
            setVariant(officialVariant);
          } else {
            const response = await fetch(`http://localhost:3001/api/variants/${variantId}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Variant = parse(await response.text());
            setVariant(data);
          }
        }
      } catch (e: any) {
        setError(e.message || 'Failed to fetch variant details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVariant();
  }, [variantId]);


  const [isGameConfigureDialogOpen, setIsGameConfigureDialogOpen] = useState<boolean>(false);
  const [isLobbyDialogOpen, setIsLobbyDialogOpen] = useState(false);

  const createGame = async (variantToPlay: Variant, preferredSide: number) => {
    try {
      const body = stringify({ variant: variantToPlay, preferredSide, timeControl: selectedTimeControl });
      const response = await fetch('http://localhost:3001/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { roomId } = await response.json();
      navigate(`/play/${roomId}`);

    } catch (err: any) {
      console.error('Error creating game:', err);
      setError(err.message || "Failed to create game.");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading variant details...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-full text-destructive">Error: {error}</div>;
  }

  if (!variant) {
    return <div>Variant not found</div>;
  }

  const ChessboardPanel = () => {  
    return (
      <>
        <ScrollArea className="flex flex-col items-center">
          <Chessboard variant={variant!} isInteractable={false} />
        </ScrollArea>
        <div className="flex flex-row gap-1 w-full px-2 md:px-0">
          <VariantConfigDialog
            variant={variant!}
            setVariant={() => {}}
            isGameConfigureDialogOpen={isGameConfigureDialogOpen}
            setIsGameConfigureDialogOpen={setIsGameConfigureDialogOpen}
            isEditable={false}
          />
          <Dialog open={isLobbyDialogOpen} onOpenChange={setIsLobbyDialogOpen}>
            <DialogTrigger asChild>
              <Button>Play!</Button>
            </DialogTrigger>
            <DialogContent className="w-[300px]">
              <DialogHeader>
                <DialogTitle>Create Lobby</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Label htmlFor="timeControl">Time Control</Label>
                <Select id="timeControl" onValueChange={setSelectedTimeControl} defaultValue={selectedTimeControl}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Time Control" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3+0">3+0</SelectItem>
                    <SelectItem value="3+2">3+2</SelectItem>
                    <SelectItem value="5+0">5+0</SelectItem>
                    <SelectItem value="5+3">5+3</SelectItem>
                    <SelectItem value="10+0">10+0</SelectItem>
                    <SelectItem value="10+5">10+5</SelectItem>
                    <SelectItem value="15+10">15+10</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="side">You play as...</Label>
                <div className="flex justify-center gap-1">
                  <Button 
                    onClick={() => setSelectedSide(0)} 
                    variant={selectedSide === 0 ? "default" : "secondary"}
                    className="flex flex-col gap-1 min-w-[90px] h-[95px] py-2"
                  >
                    <img
                      src={images['pieces/king-0']}
                      alt="White King"
                      className="w-[60px] h-[60px]"
                    />
                    <p>White</p>
                  </Button>
                  <Button 
                    onClick={() => setSelectedSide(1)} 
                    variant={selectedSide === 1 ? "default" : "secondary"}
                    className="flex flex-col gap-1 min-w-[90px] h-[95px] py-2"
                  >
                    <img
                      src={images['pieces/king-1']}
                      alt="Black King"
                      className="w-[60px] h-[60px]"
                    />
                    <p>Black</p>
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => {
                    createGame(variant!, selectedSide);
                    setIsLobbyDialogOpen(false);
                  }}
                >
                  Confirm
                </Button>
              </DialogFooter>
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
};

export default BrowseVariantInfo;
