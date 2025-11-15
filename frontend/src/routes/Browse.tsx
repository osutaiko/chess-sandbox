import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { VARIANT_PRESETS } from "@/lib/variantPresets";

import { Variant } from "common";

import Chessboard from "@/components/Chessboard";
import { PieceCard } from "@/components/PieceCard";
import VariantConfigDialog from "@/components/VariantConfigDialog";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
    const fetchOrFindVariant = async () => {
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
            const data: Variant = await response.json();
            setVariant(data);
          }
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

    fetchOrFindVariant();
  }, [variantId]);


  const [isGameConfigureDialogOpen, setIsGameConfigureDialogOpen] = useState<boolean>(false);

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
          <Dialog>
            <DialogTrigger asChild>
              <Button>Play!</Button>
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
        <div className="w-full px-4 md:px-8 py-6 md:py-8">
          {/* Official Variants Section */}
          <h2 className="text-2xl font-bold mb-4">Official Variants</h2>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border-none">
            <div className="flex w-max space-x-4 p-4">
            {VARIANT_PRESETS.map((variant) => (
              <Link to={`/browse?variantId=${variant.id}`} key={variant.id}>
                <div className="p-4 transition-shadow cursor-pointer flex flex-col items-center">
                  <h2 className="text-xl font-normal mb-4 text-center truncate w-[300px]">{variant.name}</h2>
                  <div className="w-[300px] h-[300px] flex items-center justify-center">
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ maxWidth: '100%', maxHeight: '100%', aspectRatio: `${variant.width} / ${variant.height}` }}>
                        <Chessboard variant={variant} isInteractable={false} showLabels={false} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            </div>
          </ScrollArea>

          <Separator className="my-8 h-[0.5px]" />

          {/* User Variants Section */}
          <h2 className="text-2xl font-bold mb-4 mt-8">User Variants</h2>
          {variants.length === 0 ? (
            <p>No user-created variants available. Create one!</p>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {variants.map((variant) => (
                <Link to={`/browse?variantId=${variant.id}`} key={variant.id}>
                  <div className="p-4 transition-shadow cursor-pointer flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-4 text-center truncate w-[300px]">{variant.name}</h2>
                    <div className="w-[300px] h-[300px] flex items-center justify-center">
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ maxWidth: '100%', maxHeight: '100%', aspectRatio: `${variant.width} / ${variant.height}` }}>
                          <Chessboard variant={variant} isInteractable={false} showLabels={false} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
            ))}
            </div>
          )}
        </div>
    );
  }
};

export default Browse;
