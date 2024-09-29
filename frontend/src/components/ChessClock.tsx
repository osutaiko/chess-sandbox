import { Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatTime } from "@/lib/utils";

const ChessClock = ({ timeLeft, isToMove }) => {
  return (
    <Card className={`flex flex-row items-center px-3 py-2 justify-between w-36 ${isToMove ? "bg-accent" : ""}`}>
      <Timer />
      <h3 className="text-2xl">{formatTime(timeLeft, true)}</h3>
    </Card>
  );
};

export default ChessClock;