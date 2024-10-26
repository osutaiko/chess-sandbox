import { useEffect, useState, useRef } from "react";
import { z } from "zod";

import { DEFAULT_VARIANT } from "@/lib/constants";
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

const configSchema = z.object({
  name: z.string().default("New Variant"),
  description: z.string().optional(),
  width: z.number().min(1).max(25),
  height: z.number().min(1).max(25),
});

const configType = {
  name: "text",
  description: "textarea",
  width: "number",
  height: "number",
};

const Create = () => {
  const [config, setConfig] = useState({
    name: "New Variant",
    description: "",
    width: 8,
    height: 8,
  });
  const [configErrors, setConfigErrors] = useState({});
  const [variant, setVariant] = useState(DEFAULT_VARIANT);
  const [selectedPieceColor, setSelectedPieceColor] = useState(0);
  const [selectedPieceId, setSelectedPieceId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = configType[name] === "number" ? parseInt(value) : value;
  
    setConfig((prevConfig) => ({
      ...prevConfig,
      [name]: newValue,
    }));
  };

  const updateBoard = () => {
    const newVariant = resizeBoard(variant, config.width, config.height);
    setVariant(newVariant);
  };

  const validateConfig = () => {
    try {
      configSchema.parse(config);
      setConfigErrors({});
      updateBoard();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = {};
        error.issues.forEach((issue) => {
          formattedErrors[issue.path[0]] = issue.message;
        });
        setConfigErrors(formattedErrors);
      }
    }
  };

  const handlePieceEdit = () => {

  };

  const handlePieceDelete = (pieceId) => {
    const newVariant = deletePiece(variant, pieceId);
    setVariant(newVariant);
  }
console.log(variant)
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
                value={config.name}
                onChange={handleInputChange}
              />
              {configErrors.name && <p className="text-destructive">{configErrors.name}</p>}
            </Label>
            <Label className="flex flex-col gap-2">
              Description
              <Textarea
                name="description"
                value={config.description}
                onChange={handleInputChange}
              />
              {configErrors.description && <p className="text-destructive">{configErrors.description}</p>}
            </Label>
            <div className="flex flex-row gap-4">
              <Label className="flex flex-col gap-2 w-full">
                Width (Files)
                <Input
                  type="number"
                  name="width"
                  value={config.width}
                  min={1}
                  max={25}
                  onChange={handleInputChange}
                />
                {configErrors.width && <p className="text-destructive">{configErrors.width}</p>}
              </Label>
              <Label className="flex flex-col gap-2 w-full">
                Height (Ranks)
                <Input
                  type="number"
                  name="height"
                  min={1}
                  max={25}
                  value={config.height}
                  onChange={handleInputChange}
                />
                {configErrors.height && <p className="text-destructive">{configErrors.height}</p>}
              </Label>
            </div>
          </div>
        </ScrollArea>
        <Button onClick={validateConfig}>Apply</Button>
      </div>

      <ScrollArea>
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
          <Button size="icon">
            <Plus />
          </Button>
        </div>
        <ScrollArea>
          <div className="flex flex-col gap-4">
            {variant.pieces.map((piece) => (
              <Card key={piece.id} className="bg-secondary">
                <div className="flex flex-row items-center">
                  <div className="flex flex-col items-center gap-2 p-4">
                    <div
                      className={`relative ${selectedPieceId === piece.id ? "bg-primary" : ""} rounded-md`}
                      onClick={() => {
                        setSelectedPieceId(selectedPieceId === piece.id ? null : piece.id);
                      }}>
                      <DraggablePiece piece={piece} color={selectedPieceColor} row={undefined} col={undefined} width={80} />
                      {piece.isRoyal && <Crown stroke="orange" fill="orange" className="absolute top-1 right-1" />}
                    </div>
                    <h4>{piece.name}</h4>
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

                        <DialogFooter>
                          <DialogClose asChild>
                            <Button onClick={() => handlePieceEdit(piece.id)}>
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
