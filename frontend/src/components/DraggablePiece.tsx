import { useDrag } from "react-dnd";

import { Piece } from "common/types";

import images from "@/assets/images"

const DraggablePiece: React.FC<{
  piece: Piece;
  color: number;
  row: number | null;
  col: number | null;
  draggable?: boolean;
}> = ({ piece, color, row, col, draggable = true }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "PIECE",
    item: { id: piece.id, color, sprite: piece.sprite, row, col },
    canDrag: draggable,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} className={`relative transform ${draggable ? 'cursor-pointer' : 'cursor-default'} ${isDragging ? "opacity-0" : ""} w-full`}>
      <img
        src={images[`pieces/${piece.sprite}-${color}`]}
        alt={piece.name}
        className="w-full"
      />
    </div>
  );
};

export default DraggablePiece;
