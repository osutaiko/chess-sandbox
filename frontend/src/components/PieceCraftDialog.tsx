import { useState } from "react";

import { AVAILABLE_SPRITES, EMPTY_MOVE_PROPERTY, EMPTY_PIECE_CONFIG } from "@/lib/constants";
import { PIECE_PRESETS } from "@/lib/piecePresets";
import { MoveType, Piece, PieceMove, Variant } from "@/lib/types";

import PieceMovesBoard from "@/components/PieceMovesBoard";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DualRangeSlider } from "@/components/ui/DualRangeSlider";
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
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import images from "@/assets/images";
import { Plus, ScanSearch, SquarePen, Trash2, Ellipsis, Info } from "lucide-react";

interface BaseProps {
  isCreateMode: boolean;
  variant: Variant;
  pieceConfig: Piece;
  setPieceConfig: (config: Piece) => void;
  pieceConfigErrors: Record<string, string>;
  setPieceConfigErrors: (errors: Record<string, string>) => void;
  handlePieceInputChange: (e: any) => void;
  handlePieceConfigSubmit: (isCreateMode: boolean, pieceBeforeEditId: string | null | undefined) => void;
  isEditable: boolean; // Add isEditable prop
}

// Props for create mode
interface CreateModeProps extends BaseProps {
  isCreateMode: true;
  isCreatePieceDialogOpen: boolean;
  setIsCreatePieceDialogOpen: (isOpen: boolean) => void;
  pieceBeforeEditId?: undefined;
  openPieceDialogId?: undefined;
  setOpenPieceDialogId?: undefined;
}

// Props for edit mode
interface EditModeProps extends BaseProps {
  isCreateMode: false;
  pieceBeforeEditId: string | null;
  openPieceDialogId: string | null;
  setOpenPieceDialogId: (id: string | null) => void;
  isCreatePieceDialogOpen?: undefined;
  setIsCreatePieceDialogOpen?: undefined;
}

type PieceCraftDialogProps = CreateModeProps | EditModeProps;

const PieceCraftDialog: React.FC<PieceCraftDialogProps> = ({
  isCreateMode,
  variant,
  pieceConfig,
  setPieceConfig,
  pieceConfigErrors,
  setPieceConfigErrors,
  handlePieceInputChange,
  handlePieceConfigSubmit,
  isCreatePieceDialogOpen,
  setIsCreatePieceDialogOpen,
  pieceBeforeEditId,
  openPieceDialogId,
  setOpenPieceDialogId,
  isEditable, // Destructure isEditable
}) => {
  const [highlightedMoveIndex, setHighlightedMoveIndex] = useState<number | null>(null);
  const slideInfStart = 9;

  const updateMoveProperty = (index: number, name: string, value: any) => {
    if (!isEditable) return; // Prevent changes if not editable
    const updatedMoves = [...pieceConfig.moves];
    updatedMoves[index] = { ...updatedMoves[index], [name]: value };
    setPieceConfig({ ...pieceConfig, moves: updatedMoves });
  };

  return (
    <Dialog
      open={isCreateMode ? isCreatePieceDialogOpen : pieceBeforeEditId === openPieceDialogId}
      onOpenChange={(open) => {
        if (isCreateMode) {
          setPieceConfig(EMPTY_PIECE_CONFIG);
          setIsCreatePieceDialogOpen!(open);
        } else {
          setOpenPieceDialogId!(open ? pieceBeforeEditId : null);
        }
        setPieceConfigErrors({});
        setHighlightedMoveIndex(null);
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="icon"
          onClick={() => {
            if (!isCreateMode) {
              setPieceConfig(variant.pieces.find((piece: Piece) => piece.id === pieceBeforeEditId)!);
            }
          }}
          disabled={!isEditable && isCreateMode} // Only disable create button if not editable
        >
          {isCreateMode ? <Plus /> : (isEditable ? <SquarePen /> : <Info />)}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full w-[95vw] md:w-[900px] h-[95vh] md:h-[90vh] gap-8">
        <DialogHeader>
          <DialogTitle>{isCreateMode ? "Create New Piece" : `Edit Piece`}</DialogTitle>
        </DialogHeader>
        <ScrollArea>
          <div className="flex flex-col gap-8">
            {isCreateMode && 
              <div className="flex flex-col gap-4">
                <h4>Presets</h4>
                <div className="flex flex-row gap-1 w-full overflow-x-auto">
                  {PIECE_PRESETS.slice(0, 6).map((piece) => {
                    return (
                      <Button
                        key={piece.id}
                        variant="secondary"
                        className="flex flex-col flex-none gap-1 w-[85px] h-[95px] py-2"
                        onClick={() => setPieceConfig(piece)}
                        disabled={!isEditable}
                      >
                        <img
                          src={images[`pieces/${piece.sprite}-0`]}
                          alt={piece.name}
                          className="w-full"
                        />
                        <p>{piece.name}</p>
                      </Button>
                    );
                  })}
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button variant="secondary" className="h-[95px]" disabled={!isEditable}>
                        <Ellipsis />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full h-[200px]">
                      <ScrollArea className="w-full h-full">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                          {PIECE_PRESETS.slice(6).map((piece) => {
                            return (
                              <Button
                                key={piece.id}
                                variant="secondary"
                                className="flex flex-col gap-1 w-[85px] h-[95px] py-2"
                                onClick={() => setPieceConfig({ ...pieceConfig, ...piece })}
                                disabled={!isEditable}
                              >
                                <img
                                  src={images[`pieces/${piece.sprite}-0`]}
                                  alt={piece.name}
                                  className="w-full"
                                />
                                <p>{piece.name}</p>
                              </Button>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            }
            <div className="flex flex-col gap-4">
              {isCreateMode && <h4>Piece Configuration</h4>}
              <div className="flex flex-col md:flex-row gap-4 md:gap-2">
                <Label className="flex flex-col gap-2 w-min">
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button variant="secondary" className="relative w-[200px] h-[100px] gap-3" disabled={!isEditable}>
                        {pieceConfig.sprite ? 
                          <>
                            <img
                              src={images[`pieces/${pieceConfig.sprite}-0`]}
                              className="w-full h-full"
                            />
                            <img
                              src={images[`pieces/${pieceConfig.sprite}-1`]}
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                          {AVAILABLE_SPRITES.map((sprite) => {
                            return (
                              <Button
                                key={sprite}
                                variant="secondary"
                                className="p-1 h-full gap-2"
                                onClick={() => setPieceConfig({ ...pieceConfig, sprite })}
                                disabled={!isEditable}
                              >
                                <img
                                  src={images[`pieces/${sprite}-0`]}
                                  alt={`${sprite}-0}`}
                                  className="w-[50px] aspect-square"
                                />
                                <img
                                  src={images[`pieces/${sprite}-1`]}
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
                  <Label className="flex flex-col gap-2 w-[60px]">
                    <h4>Abbr.</h4>
                    <Input
                      type="text"
                      name="id"
                      value={pieceConfig.id}
                      onChange={handlePieceInputChange}
                      disabled={!isEditable}
                    />
                    {pieceConfigErrors.id && <p className="text-destructive">{pieceConfigErrors.id}</p>}
                  </Label>
                  <Label className="flex flex-col gap-2 w-full md:w-[250px]">
                    <h4>Name</h4>
                    <Input
                      type="text"
                      name="name"
                      placeholder="New Piece"
                      value={pieceConfig.name}
                      onChange={handlePieceInputChange}
                      disabled={!isEditable}
                    />
                    {pieceConfigErrors.name && <p className="text-destructive">{pieceConfigErrors.name}</p>}
                  </Label>
                </div>
              </div>
              <Label className="flex flex-col gap-2">
                <h4>Description</h4>
                <Textarea
                  name="description"
                  value={pieceConfig.description}
                  onChange={handlePieceInputChange}
                  disabled={!isEditable}
                />
                {pieceConfigErrors.description && <p className="text-destructive">{pieceConfigErrors.description}</p>}
              </Label>
              <div className="flex flex-col gap-4">
                <div className="flex flex-row justify-between items-center">
                  <h4>Moves</h4>
                  <Button
                    size="icon"
                    onClick={() => {
                      const newMove = EMPTY_MOVE_PROPERTY("slide", "orthogonal");
                      setPieceConfig({
                        ...pieceConfig,
                        moves: [...pieceConfig.moves, newMove],
                      });
                    }}
                    disabled={!isEditable}
                  >
                    <Plus />
                  </Button>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-none md:sticky top-0 h-min md:w-[300px]">
                    <PieceMovesBoard isCraftMode={true} piece={pieceConfig} highlightedMoveIndex={highlightedMoveIndex} />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    {pieceConfig.moves.map((move: PieceMove, index) => {
                      if (move.type !== "castle") {
                        return (
                          <Card key={index}>
                            <CardHeader className="flex flex-row justify-between p-4 space-y-0">
                              <Select value={move.type} defaultValue="slide" onValueChange={(value: MoveType) => {
                                const updatedMoves = [...pieceConfig.moves];
                                updatedMoves[index] = {
                                  ...EMPTY_MOVE_PROPERTY(value, "orthogonal", updatedMoves[index]),
                                };
                                setPieceConfig({ ...pieceConfig, moves: updatedMoves });
                              }} disabled={!isEditable}>
                                <SelectTrigger className="w-[90px] bg-primary border-none font-bold">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem key="slide" value="slide">Slide</SelectItem>
                                  <SelectItem key="leap" value="leap">Leap</SelectItem>
                                  {/* <SelectItem key="hop" value="hop">Hop</SelectItem> */}
                                </SelectContent>
                              </Select>
                              <div className="flex flex-row items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  onMouseEnter={() => setHighlightedMoveIndex(index)}
                                  onMouseLeave={() => setHighlightedMoveIndex(null)}
                                  disabled={!isEditable}
                                >
                                  <ScanSearch />
                                </Button>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="destructive"
                                      disabled={!isEditable}
                                    >
                                      <Trash2 />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Deleting Move</DialogTitle>
                                      <DialogDescription>
                                        Are you sure you want to delete this move?
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button variant="destructive" onClick={() => {
                                          const updatedMoves = pieceConfig.moves.filter((_, i: number) => i !== index);
                                          setPieceConfig({ ...pieceConfig, moves: updatedMoves });
                                        }} disabled={!isEditable}>
                                          Delete
                                        </Button>
                                      </DialogClose>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-6 p-4 pt-0">
                              <div className="flex flex-row gap-x-8 gap-y-4 flex-wrap">
                                {(move.type === "slide" || move.type === "leap") && (() => {
                                  const [a, b] = move.offset;
                                  const decodedOffset =
                                    b === 0 ? "orthogonal" :
                                    a === 1 && b === 1 ? "diagonal" :
                                    "other";
                                  return (
                                    <>
                                      {move.type === "slide" && 
                                                                          <RadioGroup
                                                                            value={decodedOffset}
                                                                            onValueChange={(value) => {
                                                                              const updatedMoves = [...pieceConfig.moves];
                                                                              updatedMoves[index] = EMPTY_MOVE_PROPERTY("slide", value);
                                                                              setPieceConfig({ ...pieceConfig, moves: updatedMoves });
                                                                            }}
                                                                            disabled={!isEditable}
                                                                          >                                          <div className="flex items-center gap-2">
                                            <RadioGroupItem value="orthogonal" id="orthogonal" />
                                            <Label htmlFor="orthogonal">Orthogonal</Label>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <RadioGroupItem value="diagonal" id="diagonal" />
                                            <Label htmlFor="diagonal">Diagonal</Label>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <RadioGroupItem value="other" id="other" />
                                            <Label htmlFor="other">Other</Label>
                                          </div>
                                        </RadioGroup>
                                      }
                                      <div className="flex flex-col gap-2">
                                        <Label>Offset:</Label>
                                        <div className="flex flex-row gap-1">
                                                                              <Input
                                                                                type="number"
                                                                                name="offset-0"
                                                                                value={move.offset[0]}
                                                                                disabled={!isEditable || (move.type === "slide" && decodedOffset !== "other")}
                                                                                min={1}
                                                                                max={4}
                                                                                onChange={(e) => {
                                                                                  const newValue = parseInt(e.target.value, 10);
                                                                                  updateMoveProperty(index, "offset", [newValue, move.offset[1]]);
                                                                                }}
                                                                                className="w-[60px]"
                                                                              />
                                                                              <Input
                                                                                type="number"
                                                                                name="offset-1"
                                                                                value={move.offset[1]}
                                                                                disabled={!isEditable || (move.type === "slide" && decodedOffset !== "other")}
                                                                                min={0}
                                                                                max={move.offset[0]}
                                                                                onChange={(e) => {
                                                                                  const newValue = parseInt(e.target.value, 10);
                                                                                  updateMoveProperty(index, "offset", [move.offset[0], newValue]);
                                                                                }}
                                                                                className="w-[60px]"
                                                                              />                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                                                          <div className="flex items-center gap-2">
                                                                            <Checkbox id="forward" checked={move.canForward} onCheckedChange={(checked) => updateMoveProperty(index, "canForward", checked)} disabled={!isEditable} />
                                                                            <Label htmlFor="forward">Forward</Label>
                                                                          </div>
                                                                          <div className="flex items-center gap-2">
                                                                            <Checkbox id="backward" checked={move.canBackward} onCheckedChange={(checked) => updateMoveProperty(index, "canBackward", checked)} disabled={!isEditable} />
                                                                            <Label htmlFor="backward">Backward</Label>
                                                                          </div>
                                                                          {decodedOffset === "orthogonal" && (
                                                                            <div className="flex items-center gap-2">
                                                                              <Checkbox id="sideways" checked={move.canSideways} onCheckedChange={(checked) => updateMoveProperty(index, "canSideways", checked)} disabled={!isEditable} />
                                                                              <Label htmlFor="sideways">Sideways</Label>
                                                                            </div>
                                                                          )}                                      </div>
                                    </>
                                  );
                                })()}
                                {(move.type === "slide" || move.type === "hop") && (
                                  <div className="flex flex-col gap-4 mb-4">
                                    <Label htmlFor="range">Range:</Label>
                                    <DualRangeSlider
                                      id="range"
                                      className="w-[180px]"
                                      min={1}
                                      max={slideInfStart} // Using 9 to represent "Infinity"
                                      step={1}
                                      label={(value) => value === slideInfStart ? "∞" : String(value)}
                                      labelPosition="bottom"
                                      value={[move.range.from === Infinity ? slideInfStart : move.range.from, move.range.to === Infinity ? slideInfStart : move.range.to]}
                                      onValueChange={(value) => updateMoveProperty(index, "range", { from: value[0], to: value[1] })}
                                      disabled={!isEditable}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id="canNonCapture"
                                    checked={move.canNonCapture}
                                    onCheckedChange={(checked) => {
                                      if (checked || move.canCapture) {
                                        updateMoveProperty(index, "canNonCapture", checked);
                                      }
                                    }}
                                    disabled={!isEditable}
                                  />
                                  <Label htmlFor="canNonCapture">Allow non-capturing moves</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id="canCapture"
                                    checked={move.canCapture}
                                    onCheckedChange={(checked) => {
                                      if (checked || move.canNonCapture) {
                                        updateMoveProperty(index, "canCapture", checked);
                                      }
                                    }}
                                    disabled={!isEditable}
                                  />
                                  <Label htmlFor="canCapture">Allow capturing moves</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id="isInitialOnly"
                                    checked={move.isInitialOnly}
                                    onCheckedChange={(checked) => {updateMoveProperty(index, "isInitialOnly", checked)}}
                                    disabled={!isEditable}
                                  />
                                  <Label htmlFor="isInitialOnly">Allow only on initial move</Label>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }
                    })}
                    {/* {pieceConfig.moves.some((move) => move.type === "castle") && (
                      <Card className="p-2">
                        <Badge>Castle</Badge>
                      </Card>
                    )} */}
                  </div>
                </div>
              </div>
              <h3>Advanced</h3>
              <div className="flex flex-col gap-2">
                {/* {pieceConfig.moves.some((move) => move.isInitialOnly) &&
                  <Label className="flex flex-row items-center gap-2">
                    <Checkbox
                      checked={pieceConfig.isEnPassantTarget} 
                      onCheckedChange={(isChecked: boolean) => {
                        setPieceConfig({
                          ...pieceConfig,
                          isEnPassantCapturer: isChecked,
                        });
                      }}
                    />
                    <h4>Can be captured by <span className="italic">en passant</span> ?</h4>
                  </Label>
                }
                {pieceConfig.moves.some((move) => move.canCapture) &&
                  <Label className="flex flex-row items-center gap-2">
                    <Checkbox
                      checked={pieceConfig.isEnPassantCapturer}
                      onCheckedChange={(isChecked: boolean) => {
                        setPieceConfig({
                          ...pieceConfig,
                          isEnPassantCapturer: isChecked,
                        });
                      }}
                    />
                    <h4>Can capture other pieces via <span className="italic">en passant</span> ?</h4>
                  </Label>
                } */}
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => handlePieceConfigSubmit(isCreateMode, pieceBeforeEditId)} disabled={!isEditable}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PieceCraftDialog;
