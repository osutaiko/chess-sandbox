import { formatDate } from "@/lib/utils";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Timer, Zap, TrainFront, Sun } from "lucide-react";

const UserRatingCard = ({ title, user, isSelected, onClick }) => {
  const timeControlIcons = {
    Rapid: <Timer />,
    Blitz: <Zap />,
    Bullet: <TrainFront />,
    Daily: <Sun />,
  };

  if (title === "All") {
    return (
      <Card onClick={onClick} className={`hover:bg-secondary select-none cursor-pointer ${isSelected ? "bg-secondary" : ""}`}>
        <CardHeader className="flex flex-col justify-center h-full">
          <CardTitle>All</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      className={`hover:bg-secondary w-full select-none cursor-pointer ${isSelected ? "bg-secondary" : ""}`}
    >
      <CardHeader className="flex flex-row justify-center">
        <CardTitle className="flex flex-row gap-2">
          {timeControlIcons[title]}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2">
        {user ? (
          <>
            <h2>{user.last.rating}</h2>
            <p>Highest: {user.best.rating} ({formatDate(user.best.date, false)})</p>
            <div className="flex flex-col items-center">
              <h3>{user.record.win}W - <span className="text-muted-foreground">{user.record.draw}D</span> - {user.record.loss}L</h3>
              <p>({user.record.win + user.record.draw + user.record.loss} games)</p>
            </div>
          </>
        ) : (
          <>
            <h2>-</h2>
            <p>Highest: -</p>
            <div className="flex flex-col items-center">
              <h3>0W - 0D - 0L</h3>
              <p>(0 games)</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRatingCard;