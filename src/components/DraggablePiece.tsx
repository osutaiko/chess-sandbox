import { useDrag } from 'react-dnd';

const DraggablePiece = ({ piece, color, row, col, width }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "PIECE",
    item: { id: piece.id, color, sprite: piece.sprite, row, col },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <img
      ref={drag}
      src={`/src/assets/images/pieces/${piece.sprite}-${color}.svg`}
      alt={piece.name}
      className={`transform cursor-pointer ${isDragging ? "opacity-0" : ""}`}
      style={{ width: `${width}px` }}
    />
  );
};

export default DraggablePiece;
