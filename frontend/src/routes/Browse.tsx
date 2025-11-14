import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Variant } from "common";

import Chessboard from "@/components/Chessboard";
import PieceMovesBoard from "@/components/PieceMovesBoard";
import { PieceCard } from "@/components/PieceCard";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const Browse = () => {
  const [searchParams] = useSearchParams();
  const variantId = searchParams.get('variantId');
  const navigate = useNavigate();

  console.log('Browse.tsx: Component rendered. variantId:', variantId);

  const [variants, setVariants] = useState<Variant[]>([]); // For list view
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null); // For detail view
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<number>(-1); // -1 for random, 0 for White, 1 for Black

  useEffect(() => {
    const fetchVariants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (variantId) {
          // Fetch single variant details
          const response = await fetch(`http://localhost:3001/api/variants/${variantId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: Variant = await response.json();
          setSelectedVariant(data);
        } else {
          // Fetch all variants
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
      navigate(`/play/${roomId}`);
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

  if (variantId && selectedVariant) {
    // Render single variant details
    return (
      <div className="w-full flex flex-col md:flex-row gap-6 px-4 md:px-8 py-6 h-[calc(100vh-62px)]">
        <Card className="w-full md:w-1/2 p-4 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{selectedVariant.name}</h2>
          <p className="text-sm text-muted-foreground">{selectedVariant.description || "No description provided."}</p>
          <div className="flex flex-row gap-2">
            <Badge variant="secondary">Width: {selectedVariant.width}</Badge>
            <Badge variant="secondary">Height: {selectedVariant.height}</Badge>
            <Badge variant="secondary">Players: {selectedVariant.playerCount}</Badge>
            <Badge variant="secondary">Grid: {selectedVariant.gridType}</Badge>
          </div>
          <div className="max-w-[500px] aspect-square md:max-w-full w-full md:w-1/2">
            <Chessboard variant={selectedVariant} isInteractable={false} />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-md font-semibold">Choose Your Side:</h3>
            <div className="flex gap-2">
              <Button
                variant={selectedSide === 0 ? "default" : "outline"}
                onClick={() => setSelectedSide(0)}
              >
                White
              </Button>
              <Button
                variant={selectedSide === 1 ? "default" : "outline"}
                onClick={() => setSelectedSide(1)}
              >
                Black
              </Button>
              <Button
                variant={selectedSide === -1 ? "default" : "outline"}
                onClick={() => setSelectedSide(-1)}
              >
                Random
              </Button>
            </div>
          </div>
          <Button onClick={() => createGame(selectedVariant, selectedSide)} className="w-full">Play This Variant</Button>
        </Card>

        <Card className="w-full md:w-1/2 p-4 flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Pieces</h3>
          <ScrollArea className="flex-grow">
            <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(310px,1fr))] pb-8 md:pb-0">
              {selectedVariant.pieces.map((piece) => {
                const isRoyal = selectedVariant.royals.includes(piece.id);
                return (
                  <PieceCard
                    piece={piece}
                    selectedPieceId={null}
                    setSelectedPieceId={() => {}}
                    selectedPieceColor={0}
                    isRoyal={isRoyal}
                    setVariant={() => {}}
                    variant={{} as any}
                    isEditable={false}
                    pieceConfig={{} as any}
                    setPieceConfig={() => {}}
                    pieceConfigErrors={{}} 
                    setPieceConfigErrors={() => {}} 
                    handlePieceInputChange={() => {}}
                    handlePieceConfigSubmit={() => {}} 
                    openPieceDialogId={null}
                    setOpenPieceDialogId={() => {}}
                    handlePieceDelete={() => {}}
                  />
                );
              })}
            </div>
          </ScrollArea>
        </Card>
      </div>
    );
  }

  // Render list of variants
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Browse Variants</h1>
      {variants.length === 0 ? (
        <p>No variants available. Create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {variants.map((variant) => (
            <Link to={`/browse?variantId=${variant.id}`} key={variant.id}>
              <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <h2 className="text-xl font-semibold">{variant.name}</h2>
                <p className="text-gray-600">{variant.description}</p>
                <Badge variant="secondary">Players: {variant.playerCount}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;
