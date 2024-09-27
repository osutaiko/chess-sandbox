import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const User = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const handleUserApiRequest = async (username) => {
      const response = await fetch(`http://localhost:3000/api/user/${username}`);
      const data = await response.json();console.log(data)
      setUserData(data);
    };

    if (username) {
      handleUserApiRequest(username);
    }
  }, [username]);

  return (
    <div>
      <p>Username</p>
    </div>
  );
};

export default User;