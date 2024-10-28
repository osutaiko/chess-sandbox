
import { useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";

const DraggablePiece = ({ piece, color, row, col }) => {
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
