import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useNavigate } from "react-router-dom";

import { DEFAULT_VARIANT, EMPTY_PIECE_CONFIG } from "@/lib/constants";
import { deletePiece, Piece, PieceErrors, Variant, stringify } from "common";

import Chessboard from "@/components/Chessboard";
import PieceCraftDialog from "@/components/PieceCraftDialog";
import { PieceCard } from "@/components/PieceCard";
import VariantConfigDialog from "@/components/VariantConfigDialog";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const Create = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();

  const [variant, setVariant] = useState<Variant>(structuredClone(DEFAULT_VARIANT)); // Variant after form confirmation
  const [selectedPieceColor, setSelectedPieceColor] = useState<number>(0);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [isCreatePieceDialogOpen, setIsCreatePieceDialogOpen] = useState<boolean>(false);
  const [openPieceDialogId, setOpenPieceDialogId] = useState<string | null>(null);
  const [isGameConfigureDialogOpen, setIsGameConfigureDialogOpen] = useState<boolean>(false);
  const [isSavingVariant, setIsSavingVariant] = useState<boolean>(false);

  const handlePieceDelete = (pieceId: string) => {
    const newVariant = deletePiece(variant, pieceId);
    setVariant(newVariant);
  }

  const saveVariant = async () => {
    setIsSavingVariant(true);
    try {
      const variantString = stringify({ variant });

      const response = await fetch('http://localhost:3001/api/variants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: variantString,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { variantId } = await response.json();
      console.log('Variant saved with ID:', variantId);
      navigate(`/browse?variantId=${variantId}`);
    } catch (error: any) {
      console.error('Error saving variant:', error);
    } finally {
      setIsSavingVariant(false);
    }
  };

  const ChessboardPanel = () => {
    return (
      <>
        <ScrollArea className="flex flex-col items-center">
          <Chessboard variant={variant} isInteractable={true} setVariant={setVariant} selectedPieceId={selectedPieceId} selectedPieceColor={selectedPieceColor} />
        </ScrollArea>
        <div className="flex flex-row gap-1 w-full px-2 md:px-0">
          <VariantConfigDialog
            variant={variant}
            setVariant={setVariant}
            isGameConfigureDialogOpen={isGameConfigureDialogOpen}
            setIsGameConfigureDialogOpen={setIsGameConfigureDialogOpen}
            isEditable={true}
          />
          <Button onClick={saveVariant} disabled={isSavingVariant} className="relative">
            {isSavingVariant ? 'Saving Variant...' : 'Save Variant'}
          </Button>
        </div>
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
            isEditable={true}
          />
        </div>
        <ScrollArea>
          <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(310px,1fr))] px-2 md:px-0 pb-8 md:pb-0">
            {variant.pieces.map((piece) => {
              const isRoyal = variant.royals.includes(piece.id);
              return (
                <PieceCard
                  piece={piece}
                  selectedPieceId={selectedPieceId}
                  setSelectedPieceId={setSelectedPieceId}
                  selectedPieceColor={selectedPieceColor}
                  isRoyal={isRoyal}
                  setVariant={setVariant}
                  variant={variant}
                  isEditable={true}
                  pieceConfig={pieceConfig}
                  setPieceConfig={setPieceConfig}
                  pieceConfigErrors={pieceConfigErrors}
                  setPieceConfigErrors={setPieceConfigErrors}
                  handlePieceInputChange={handlePieceInputChange}
                  handlePieceConfigSubmit={() => handlePieceConfigSubmit(false, piece.id)}
                  openPieceDialogId={openPieceDialogId}
                  setOpenPieceDialogId={setOpenPieceDialogId}
                  handlePieceDelete={handlePieceDelete}
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
        <div className="flex flex-col gap-2 w-full">
          <PiecesPanel openPieceDialogId={openPieceDialogId} setOpenPieceDialogId={setOpenPieceDialogId} />
        </div>
      </div>
    );
  }
};

export default Create;