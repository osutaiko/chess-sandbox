import { useEffect, useState, useRef } from "react";
import { z } from "zod";

import { DEFAULT_VARIANT, EMPTY_PIECE_CONFIG, EMPTY_GAME_CONFIG } from "@/lib/constants";
import { deletePiece, resizeBoard } from "@/lib/chess";
import Chessboard from "@/components/Chessboard";
import PieceMovementsBoard from "@/components/PieceMovementsBoard";
import DraggablePiece from "@/components/DraggablePiece";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";

import { Crown, Plus, SquarePen, Trash2 } from "lucide-react";
import PieceCraftDialog from "@/components/PieceCraftDialog";

const gameConfigType = {
  name: "text",
  description: "textarea",
  width: "number",
  height: "number",
};

const pieceConfigType = {
};

const Create = () => {
  const [gameConfig, setGameConfig] = useState(EMPTY_GAME_CONFIG);
  const [gameConfigErrors, setGameConfigErrors] = useState({});
  const [variant, setVariant] = useState(DEFAULT_VARIANT);
  const [selectedPieceColor, setSelectedPieceColor] = useState(0);
  const [selectedPieceId, setSelectedPieceId] = useState(null);
  const [pieceConfig, setPieceConfig] = useState(EMPTY_PIECE_CONFIG);
  const [pieceConfigErrors, setPieceConfigErrors] = useState({});
  const [isCreatePieceDialogOpen, setIsCreatePieceDialogOpen] = useState(false);
  const [openPieceDialogId, setOpenPieceDialogId] = useState(null);

  const handleGameInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = gameConfigType[name] === "number" ? parseInt(value) : value;
  
    setGameConfig((prevConfig) => ({
      ...prevConfig,
      [name]: newValue,
    }));
  };

  const handlePieceInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = pieceConfigType[name] === "number" ? parseInt(value) : value;
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
      const newVariant = resizeBoard(variant, gameConfig.width, gameConfig.height);
      setVariant(newVariant);
    }
  };

  const handlePieceConfigSubmit = (isCreateMode, pieceBeforeEditId) => {
    const errors = {};console.log(pieceBeforeEditId)

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
      <div className="flex flex-col flex-none gap-8 w-[300px] pr-8">
        <h3>Game Configuration</h3>
        <ScrollArea>
          <div className="flex flex-col gap-5">
            <Label className="flex flex-col gap-2">
              Variant Name
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
              Description
              <Textarea
                name="description"
                value={gameConfig.description}
                onChange={handleGameInputChange}
              />
              {gameConfigErrors.description && <p className="text-destructive">{gameConfigErrors.description}</p>}
            </Label>
            <div className="flex flex-row gap-4">
              <Label className="flex flex-col gap-2 w-full">
                Width (# of Files)
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
                Height (# of Ranks)
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
            {variant.pieces.map((piece) => (
              <Card key={piece.id} className="bg-secondary">
                <div className="flex flex-row items-center">
                  <div className="flex flex-col items-center gap-2 p-4 w-[150px]">
                    <div
                      className={`relative ${selectedPieceId === piece.id ? "bg-primary" : ""} rounded-md`}
                      onClick={() => {
                        setSelectedPieceId(selectedPieceId === piece.id ? null : piece.id);
                      }}>
                      <div className="w-[80px]">
                        <DraggablePiece piece={piece} color={selectedPieceColor} row={undefined} col={undefined} />
                      </div>
                      {variant.royals.includes(piece.id) && <Crown stroke="orange" fill="orange" className="absolute top-0 right-0" />}
                    </div>
                    <h4>{piece.name} ({piece.id})</h4>
                  </div>
                  <div className="py-4">
                    <PieceMovementsBoard piece={piece} selectedColor={selectedPieceColor} />
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
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Create;
