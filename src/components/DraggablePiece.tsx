import { useDrag } from "react-dnd";
import { Crown } from "lucide-react";

const DraggablePiece = ({ piece, color, row, col, isRoyal=false }) => {
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
      />
      {isRoyal && <Crown stroke="orange" fill="orange" className="absolute top-0 right-0" />}
    </div>
  );
};

export default DraggablePiece;
