import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const UserRatingCard = ({ title, data, isSelected, onClick }) => {
  if (title === "All") {
    return (
      <Card onClick={onClick} className={`select-none cursor-pointer ${isSelected ? "bg-secondary" : ""}`}>
        <CardHeader className="flex flex-col justify-center h-full">
          <CardTitle>All</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      className={`w-full select-none cursor-pointer ${isSelected ? "bg-secondary" : ""}`}
    >
      <CardHeader className="flex flex-row justify-center">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2">
        {data ? (
          <>
            <h2>{data.last.rating}</h2>
            <p>Highest: {data.best.rating} ({formatDate(data.best.date)})</p>
            <div className="flex flex-col items-center">
              <h3>{data.record.win}W - <span className="text-muted-foreground">{data.record.draw}D</span> - {data.record.loss}L</h3>
              <p>({data.record.win + data.record.draw + data.record.loss} games)</p>
            </div>
          </>
        ) : (
          <>
            <h2>-</h2>
            <p>Highest: -</p>
            <h3>0W - 0D - 0L</h3>
            <p>(0 games)</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRatingCard;