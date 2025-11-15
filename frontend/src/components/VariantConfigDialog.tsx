import React, { useState, useEffect } from "react";
import { Variant, VariantErrors, Piece } from "common";
import { resizeBoard } from "common";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";


interface VariantConfigDialogProps {
  variant: Variant;
  setVariant: React.Dispatch<React.SetStateAction<Variant>>;
  isGameConfigureDialogOpen: boolean;
  setIsGameConfigureDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditable: boolean;
}

const VariantConfigDialog: React.FC<VariantConfigDialogProps> = ({
  variant,
  setVariant,
  isGameConfigureDialogOpen,
  setIsGameConfigureDialogOpen,
  isEditable,
}) => {
  const [gameConfig, setGameConfig] = useState<Variant>(structuredClone(variant));
  const [gameConfigErrors, setGameConfigErrors] = useState<VariantErrors>({});

  // Reset gameConfig when dialog opens or variant prop changes if not editable
  useEffect(() => {
    if (!isEditable || isGameConfigureDialogOpen) {
      setGameConfig(structuredClone(variant));
      setGameConfigErrors({});
    }
  }, [variant, isGameConfigureDialogOpen, isEditable]);

  const handleGameInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!isEditable) return;
    const { name, value } = e.target;
    const newValue = (name === "width" || name === "height" || name === "nMoveRuleCount") ? parseInt(value) : value;
  
    setGameConfig((prevConfig) => ({
      ...prevConfig,
      [name]: newValue,
    }));
  };

  const handleGameCheckedChange = (name: string, checked: boolean) => {
    if (!isEditable) return;
    setGameConfig((prevConfig) => ({
      ...prevConfig,
      [name]: checked,
    }));
  };

  const handleToggleGroupChange = (value: string[]) => {
    if (!isEditable) return;
    setGameConfig((prev) => ({
      ...prev,
      nMoveRulePieces: value,
    }));
  };

  const handleGameConfigSubmit = () => {
    if (!isEditable) return;
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
    if (gameConfig.nMoveRuleCount !== undefined && (gameConfig.nMoveRuleCount < 0 || gameConfig.nMoveRuleCount > 1000)) {
      errors.nMoveRuleCount = "N-move rule count must be between 0 and 1000.";
    }
    setGameConfigErrors(errors);

    if (Object.keys(errors).length === 0) {
      const newVariant = resizeBoard(gameConfig);
      setVariant(newVariant);
      setIsGameConfigureDialogOpen(false);
    }
  };

  return (
    <Dialog open={isGameConfigureDialogOpen} onOpenChange={setIsGameConfigureDialogOpen}>
      <DialogTrigger asChild className="w-full">
        <Button variant="secondary" onClick={() => setIsGameConfigureDialogOpen(true)}>
          {isEditable? "Configure Variant" : "Variant Details"}
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
                disabled={!isEditable}
              />
              {gameConfigErrors.name && <p className="text-destructive">{gameConfigErrors.name}</p>}
            </Label>
            <Label className="flex flex-col gap-2">
              <h4>Description</h4>
              <Textarea
                name="description"
                value={gameConfig.description}
                onChange={handleGameInputChange}
                disabled={!isEditable}
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
                  disabled={!isEditable}
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
                  disabled={!isEditable}
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
                      disabled={!isEditable}
                    />
                    <Label htmlFor="isWinOnCheckmate" className={isEditable ? "" : "cursor-not-allowed opacity-70"}>Checkmate the opponent</Label>
                  </div>
                  <RadioGroup
                    value={String(gameConfig.mustCheckmateAllRoyals)}
                    onValueChange={(value) => handleGameCheckedChange("mustCheckmateAllRoyals", value === "true")}
                    className="ml-6 mb-2"
                    disabled={!isEditable}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="false" id="false" disabled={!isEditable} />
                      <Label htmlFor="false" className={isEditable ? "" : "cursor-not-allowed opacity-70"}>... One of the royals</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="true" id="true" disabled={!isEditable} />
                      <Label htmlFor="true" className={isEditable ? "" : "cursor-not-allowed opacity-70"}>... the final remaining royal</Label>
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
                  disabled={!isEditable}
                />
                <Label htmlFor="isWinOnStalemate" className={isEditable ? "" : "cursor-not-allowed opacity-70"}>Stalemate the opponent</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isWinOnOpponentWipe"
                  name="isWinOnOpponentWipe"
                  checked={gameConfig.isWinOnOpponentWipe}
                  onCheckedChange={(checked: boolean) => handleGameCheckedChange("isWinOnOpponentWipe", checked)}
                  disabled={!isEditable}
                />
                <Label htmlFor="isWinOnOpponentWipe" className={isEditable ? "" : "cursor-not-allowed opacity-70"}>Capture all opponent's pieces</Label>
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
                  disabled={!isEditable}
                />
                <Label htmlFor="isDrawOnStalemate" className={isEditable ? "" : "cursor-not-allowed opacity-70"}>Stalemate the opponent</Label>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox checked={true} disabled={true} />
                  <Label className="!cursor-default !opacity-100">N-move rule</Label>
                </div>
                <div className="flex flex-col gap-2 ml-6">
                  <Label htmlFor="nMoveRuleCount" className={isEditable ? "" : "cursor-not-allowed opacity-70"}>... on move:</Label>
                  <Input
                    type="number"
                    name="nMoveRuleCount"
                    value={gameConfig.nMoveRuleCount}
                    onChange={handleGameInputChange}
                    className="w-[100px]"
                    disabled={!isEditable}
                  />
                  {gameConfigErrors.nMoveRuleCount && <p className="text-destructive">{gameConfigErrors.nMoveRuleCount}</p>}
                  <Label htmlFor="nMoveRulePieces" className={isEditable ? "" : "cursor-not-allowed opacity-70"}>... resets after one of the following moves:</Label>
                  <ToggleGroup
                    type="multiple" 
                    variant="outline" 
                    value={gameConfig.nMoveRulePieces}
                    onValueChange={handleToggleGroupChange}
                    className="grid grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-1 justify-items-start"
                    disabled={!isEditable}
                  >
                    {gameConfig.pieces.map((piece) => (
                      <ToggleGroupItem
                        key={piece.id}
                        value={piece.id}
                        className="w-full h-[36px] flex items-center justify-center"
                        disabled={!isEditable}
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
        {isEditable && <Button onClick={handleGameConfigSubmit}>Apply</Button>}
      </DialogContent>
    </Dialog>
  );
};

export default VariantConfigDialog;