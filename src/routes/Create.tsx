import { useEffect, useState, useRef } from "react";
import { z } from "zod";

import { DEFAULT_VARIANT, PIECE_PRESETS, AVAILABLE_SPRITES } from "@/lib/constants";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

import { Crown, Plus, SquarePen, Trash2 } from "lucide-react";

const gameConfigType = {
  name: "text",
  description: "textarea",
  width: "number",
  height: "number",
};

const pieceConfigType = {
};

const Create = () => {
  const [gameConfig, setGameConfig] = useState({
    name: "New Variant",
    description: "",
    width: 8,
    height: 8,
  });
  const [gameConfigErrors, setGameConfigErrors] = useState({});
  const [variant, setVariant] = useState(DEFAULT_VARIANT);
  const [selectedPieceColor, setSelectedPieceColor] = useState(0);
  const [selectedPieceId, setSelectedPieceId] = useState(null);
  const [pieceConfig, setPieceConfig] = useState({
    id: "",
    name: "New Piece",
    description: "",
    sprite: "",
    moves: [],
    promotions: [],
    isEnPassantTarget: false,
    isEnPassantCapturer: false,
  });
  const [pieceConfigErrors, setPieceConfigErrors] = useState({});
  const [isCreatePieceDialogOpen, setIsCreatePieceDialogOpen] = useState(false);
  
  console.log(pieceConfig)

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

  const handlePieceConfigSubmit = (closeDialog) => {
    const errors = {};

    variant.pieces.forEach((piece) => {
      if (!pieceConfig.id) {
        errors.id = "One-letter piece abbreviation is required.";
      }
      if (pieceConfig.id === piece.id) {
        errors.id = "The one-letter piece abbreviation should be unique.";
      }
      if (!pieceConfig.name) {
        errors.name = "Piece name is required.";
      }
      if (pieceConfig.name === piece.name) {
        errors.name = "There is already another piece with this name.";
      }
      if (!pieceConfig.sprite) {
        errors.sprite = "Please select a sprite for your piece.";
      }
      if (pieceConfig.sprite === piece.sprite) {
        errors.sprite = "There is already another piece using this sprite.";
      }
    })
    setPieceConfigErrors(errors);console.log(errors)

    if (Object.keys(errors).length === 0) {
      setVariant({ ...variant, pieces: [...variant.pieces, pieceConfig] });
      setIsCreatePieceDialogOpen(false);
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
          <Dialog open={isCreatePieceDialogOpen} onOpenChange={setIsCreatePieceDialogOpen}>
            <DialogTrigger asChild>
            <Button size="icon">
              <Plus />
            </Button>
            </DialogTrigger>
            <DialogContent className="max-w-full w-[1000px] gap-8">
              <DialogHeader>
                <DialogTitle>Create Piece</DialogTitle>
              </DialogHeader>
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
              <div className="flex flex-col gap-4">
                <h4>Piece Configuration</h4>
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
                </Label>
                <Label className="flex flex-col gap-2">
                  Advanced
                </Label>
              </div>
              <DialogFooter>
                <Button onClick={handlePieceConfigSubmit}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                      {variant.royals.includes(piece.id) && <Crown stroke="orange" fill="orange" className="absolute top-1 right-1" />}
                    </div>
                    <h4>{piece.name} ({piece.id})</h4>
                  </div>
                  <div className="py-4">
                    <PieceMovementsBoard piece={piece} selectedColor={selectedPieceColor} />
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="icon">
                          <SquarePen />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Piece</DialogTitle>
                        </DialogHeader>
                          asdf
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button onClick={handlePieceConfigSubmit}>
                              Confirm
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
