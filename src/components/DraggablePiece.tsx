import { Piece } from "@/lib/types";

import { useDrag } from "react-dnd";

const DraggablePiece: React.FC<{
  piece: Piece;
  color: number;
  row: number | null;
  col: number | null;
}> = ({ piece, color, row, col }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "PIECE",
    item: { id: piece.id, color, sprite: piece.sprite, row, col },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} className={`relative transform cursor-pointer ${isDragging ? "opacity-0" : ""} w-full`}>
      <img
        src={`/src/assets/images/pieces/${piece.sprite}-${color}.svg`}
        alt={piece.name}
        className="w-full"
      />
    </div>
  );
};

export default DraggablePiece;
