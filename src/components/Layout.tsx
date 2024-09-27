import { Outlet, Link, useLocation } from "react-router-dom";

import { Github } from "lucide-react";

const Layout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col w-full items-center min-h-screen">
      {location.pathname === "/" ?
        <header className="fixed top-0 right-0 p-4">
          <Link to="https://github.com/osutaiko/pawn-pulse">
            <Github />
          </Link>
        </header> :   
        <header className="flex flex-col px-6 py-4 w-full items-center border-b">
          <div className="flex flex-row justify-between items-center w-full max-w-screen-xl">
            <Link to="/">
              <h2>Pawnpulse</h2>
            </Link>
            <Link to="https://github.com/osutaiko/pawn-pulse">
              <Github />
            </Link>
          </div>
        </header>
      }
      <main className="flex flex-grow flex-col p-6 w-full max-w-screen-xl h-full items-center">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
