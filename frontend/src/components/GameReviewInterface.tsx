import { Chess } from "chess.js";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const GameReviewInterface = ({ moves }) => {
  return (
    <Card className="h-full">
      <div className="p-4">
        <h3>Review</h3>
      </div>
      <Separator />
      <div className="p-4">
        <Button className="w-full">Request Game Review</Button>
      </div>
    </Card>
  );
};

export default GameReviewInterface;