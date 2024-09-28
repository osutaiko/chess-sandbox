import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import UserRatingCard from "@/components/UserRatingCard";

import { Badge } from "@/components/ui/badge";

import ChessComAvatarFallback from "/src/assets/images/chess-com-avatar-fallback.png";
import InternationalFlagIcon from "/src/assets/images/international-flag.jpg"

const User = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState("All");

  const fetchUserBasicProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/api/user/${username}/basic`);
      
      if (!response.ok) {
        throw new Error(response.status === 404 ? 'User not found' : 'An error occurred');
      }

      const data = await response.json();
      setUser(data);
    } catch (e) {
      setError(e.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return <h4>Loading...</h4>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!user) {
    return <h2>No user data available</h2>;
  }

  return (
    <div className="flex flex-col gap-12 w-full">
      <div className="flex flex-row gap-6">
        <img
          alt={`Avatar of ${username}`}
          src={user.avatar || ChessComAvatarFallback}
          className="h-28 rounded-md"
        />
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-4 items-center">
            {user.title && <Badge className="h-10 rounded-md text-2xl">{user.title}</Badge>}
            <h2>{username}</h2>
            <img
              alt={`Flag of ${getCountryCodeFromUrl(user.country)}`}
              src={getCountryCodeFromUrl(user.country) === "XX" ?
                InternationalFlagIcon :
                `http://purecatamphetamine.github.io/country-flag-icons/3x2/${getCountryCodeFromUrl(user.country)}.svg`
              }
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
    </div>
  );
};

export default User;