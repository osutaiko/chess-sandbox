import { useState } from "react";

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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Plus, ScanSearch, SquarePen, Trash2 } from "lucide-react";
import { AVAILABLE_SPRITES, EMPTY_MOVE_PROPERTY, EMPTY_PIECE_CONFIG, PIECE_PRESETS } from "@/lib/constants";
import PieceMovesBoard from "@/components/PieceMovesBoard";
import { decodeSlideOffsets, encodeSlideOffsets } from "@/lib/chess";

const PieceCraftDialog = ({
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
}) => {
  const [highlightedMoveIndex, setHighlightedMoveIndex] = useState(null);

  const slideInfStart = 9;

  const updateMoveProperty = (index, name, value) => {
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
          setIsCreatePieceDialogOpen(open);
        } else {
          setOpenPieceDialogId(open ? pieceBeforeEditId : null);
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
            setPieceConfig(variant.pieces.find((piece) => piece.id === pieceBeforeEditId));
          }
        }}
      >
        {isCreateMode ? <Plus /> : <SquarePen />}
      </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full w-[900px] gap-8">
        <DialogHeader>
          <DialogTitle>{isCreateMode ? "Create New Piece" : `Edit Piece`}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[600px]">
          <div className="flex flex-col gap-8">
            {isCreateMode && 
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
            }
            <div className="flex flex-col gap-4">
              {isCreateMode && <h4>Piece Configuration</h4>}
              <div className="flex flex-row gap-2">
                <Label className="flex flex-col gap-2 w-min">
                  <Popover modal={true}>
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
                <Label className="flex flex-col gap-2">
                  <h4>Name</h4>
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
                  <h4>Abbr.</h4>
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
                <h4>Description</h4>
                <Textarea
                  name="description"
                  value={pieceConfig.description}
                  onChange={handlePieceInputChange}
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
                  >
                    <Plus />
                  </Button>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="flex-none sticky top-0 h-min">
                    <PieceMovesBoard isCraftMode={true} piece={pieceConfig} highlightedMoveIndex={highlightedMoveIndex} />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    {pieceConfig.moves.map((move, index) => {
                      if (move.type !== "castle") {
                        return (
                          <Card key={index}>
                            <CardHeader className="flex flex-row justify-between p-4 space-y-0">
                              <Select value={move.type} defaultValue="slide" onValueChange={(value) => {
                                const updatedMoves = [...pieceConfig.moves];
                                updatedMoves[index] = {
                                  ...EMPTY_MOVE_PROPERTY(value, "orthogonal", updatedMoves[index]),
                                };
                                setPieceConfig({ ...pieceConfig, moves: updatedMoves });
                              }}>
                                <SelectTrigger className="w-[90px] bg-primary border-none font-bold">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem key="slide" value="slide">Slide</SelectItem>
                                  <SelectItem key="leap" value="leap">Leap</SelectItem>
                                  {/* <SelectItem key="hop" value="hop">Hop</SelectItem> */}
                                </SelectContent>
                              </Select>
                              <div className="flex flex-row items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  onMouseEnter={() => setHighlightedMoveIndex(index)}
                                  onMouseLeave={() => setHighlightedMoveIndex(null)}
                                >
                                  <ScanSearch />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => {
                                    const updatedMoves = pieceConfig.moves.filter((_, i) => i !== index);
                                    setPieceConfig({ ...pieceConfig, moves: updatedMoves });
                                  }}
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-6 p-4 pt-0">
                              <div className="flex flex-row gap-8">
                                {(move.type === "slide" || move.type === "leap") && (() => {
                                  const [a, b] = move.offset;
                                  const decodedOffset =
                                    b === 0 ? "orthogonal" :
                                    a === 1 && b === 1 ? "diagonal" :
                                    "other";
                                  return (
                                    <>
                                      <div className="flex flex-col gap-4">
                                        {move.type === "slide" && 
                                          <RadioGroup
                                            value={decodedOffset}
                                            onValueChange={(value) => {
                                              const updatedMoves = [...pieceConfig.moves];
                                              updatedMoves[index] = EMPTY_MOVE_PROPERTY("slide", value);
                                              setPieceConfig({ ...pieceConfig, moves: updatedMoves });
                                            }}
                                          >
                                            <div className="flex items-center gap-2">
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
                                              disabled={move.type === "slide" && decodedOffset !== "other"}
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
                                              disabled={move.type === "slide" && decodedOffset !== "other"}
                                              min={0}
                                              max={move.offset[0]}
                                              onChange={(e) => {
                                                const newValue = parseInt(e.target.value, 10);
                                                updateMoveProperty(index, "offset", [move.offset[0], newValue]);
                                              }}
                                              className="w-[60px]"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                          <Checkbox id="forward" checked={move.canForward} onCheckedChange={(checked) => updateMoveProperty(index, "canForward", checked)} />
                                          <Label htmlFor="forward">Forward</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Checkbox id="backward" checked={move.canBackward} onCheckedChange={(checked) => updateMoveProperty(index, "canBackward", checked)} />
                                          <Label htmlFor="backward">Backward</Label>
                                        </div>
                                        {decodedOffset === "orthogonal" && (
                                          <div className="flex items-center gap-2">
                                            <Checkbox id="sideways" checked={move.canSideways} onCheckedChange={(checked) => updateMoveProperty(index, "canSideways", checked)} />
                                            <Label htmlFor="sideways">Sideways</Label>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  );
                                })()}
                                {(move.type === "slide" || move.type === "hop") && (
                                  <div className="flex flex-col gap-4">
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
                                  />
                                  <Label htmlFor="canCapture">Allow capturing moves</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id="isInitialOnly"
                                    checked={move.isInitialOnly}
                                    onCheckedChange={(checked) => {updateMoveProperty(index, "isInitialOnly", checked)}}
                                  />
                                  <Label htmlFor="isInitialOnly">Allow only on initial move</Label>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }
                    })}
                    {pieceConfig.moves.some((move) => move.type === "castle") && (
                      <Card className="p-2">
                        <Badge>Castle</Badge>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
              <h3>Advanced</h3>
              <div className="flex flex-col gap-2">
                {pieceConfig.moves.some((move) => move.isInitialOnly) &&
                  <Label className="flex flex-row items-center gap-2">
                    <Checkbox
                      checked={pieceConfig.isEnPassantTarget} 
                      onCheckedChange={(isChecked) => {
                        setPieceConfig((prevConfig) => ({
                          ...prevConfig,
                          isEnPassantTarget: isChecked,
                        }));
                      }}
                    />
                    <h4>Can be captured by <span className="italic">en passant</span> ?</h4>
                  </Label>
                }
                <Label className="flex flex-row items-center gap-2">
                  <Checkbox
                    checked={pieceConfig.isEnPassantCapturer}
                    onCheckedChange={(isChecked) => {
                      setPieceConfig((prevConfig) => ({
                        ...prevConfig,
                        isEnPassantCapturer: isChecked,
                      }));
                    }}
                  />
                  <h4>Can capture other pieces via <span className="italic">en passant</span> ?</h4>
                </Label>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => handlePieceConfigSubmit(isCreateMode, pieceBeforeEditId)}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PieceCraftDialog;
