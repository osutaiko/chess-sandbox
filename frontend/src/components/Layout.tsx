import { Outlet, Link, useLocation } from "react-router-dom";

import { Activity, Github } from "lucide-react";

const Layout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen select-none">
      {location.pathname === "/" ?
        <header className="fixed top-0 right-0 p-8">
          <Link to="https://github.com/osutaiko/pawn-pulse">
            <Github />
          </Link>
        </header> :   
        <header className="flex flex-col p-8 items-center">
          <div className="flex flex-row justify-between items-center w-full max-w-screen-2xl">
            <Link to="/" className="flex flex-row gap-2">
              <Activity />
              <h3>Pawnpulse</h3>
            </Link>
            <Link to="https://github.com/osutaiko/pawn-pulse">
              <Github />
            </Link>
          </div>
        </header>
      }
      <main className="flex flex-grow flex-col px-8 items-center">
        <div className="flex flex-grow w-full max-w-screen-2xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
