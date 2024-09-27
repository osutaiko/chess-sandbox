import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import UserRatingCard from "@/components/UserRatingCard";

import { Badge } from "@/components/ui/badge";

import ChessComAvatarFallback from "/src/assets/images/chess-com-avatar-fallback.png";
import { Timer, Zap, TrainFront, Sun } from "lucide-react";

const User = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [selectedCard, setSelectedCard] = useState("All");

  const fetchUserBasicProfile = async () => {
    const response = await fetch(`http://localhost:3000/api/user/${username}/basic`);
    const data = await response.json();
    setUser(data);
    console.log(data);
  };

  useEffect(() => {
    if (username) {
      fetchUserBasicProfile();
    }
  }, [username]);

  const getCountryCodeFromUrl = (countryUrl: string) => {
    const parts = countryUrl.split("/");
    return parts[parts.length - 1];
  };

  return (
    user ? 
      <div className="flex flex-col gap-12 w-full">
        <div className="flex flex-row gap-6">
          {user.avatar ? 
            <img
              alt={`Avatar of ${username}`}
              src={user.avatar}
              className="h-28 rounded-md"
            /> : 
            <img
              alt="Fallback Avatar"
              src={ChessComAvatarFallback}
              className="h-28 rounded-md"
            />
          }
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-4 items-center">
              {user.title && <Badge className="h-10 rounded-md text-2xl">{user.title}</Badge>}
              <h2>{username}</h2>
              <img
                alt={`Flag of ${getCountryCodeFromUrl(user.country)}`}
                src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${getCountryCodeFromUrl(user.country)}.svg`}
                className="h-8 rounded-sm"
              />
            </div>
            {user.name && <p>{user.name}</p>}
          </div>
        </div>
        <div className="flex flex-row gap-4 w-full">
          {["All", "Rapid", "Blitz", "Bullet", "Daily"].map((title) => (
            <UserRatingCard
              key={title}
              title={title}
              data={user[`chess_${title.toLowerCase()}`]}
              isSelected={selectedCard === title}
              onClick={() => setSelectedCard(title)}
            />
          ))}
        </div>
      </div> : 
      <p>Loading...</p>
  );
};

export default User;