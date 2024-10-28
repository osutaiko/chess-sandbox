
import { useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { Crown } from "lucide-react";

const DraggablePiece = ({ piece, color, row, col, isRoyal=false }) => {
  const imgRef = useRef(null);
  const [crownSize, setCrownSize] = useState(0);

  useEffect(() => {
    if (imgRef.current) {
      setCrownSize(imgRef.current.offsetWidth / 3);
    }
  }, [imgRef.current?.offsetWidth]);

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
        ref={imgRef}
        src={`/src/assets/images/pieces/${piece.sprite}-${color}.svg`}
        alt={piece.name}
        className="w-full"
      />
      {isRoyal && <Crown stroke="orange" fill="orange" className="absolute top-0.5 right-0.5" style={{ width: crownSize }} />}
    </div>
  );
};

export default DraggablePiece;
