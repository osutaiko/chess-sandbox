import { Outlet, Link } from "react-router-dom";

import { Castle, Github } from "lucide-react";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen select-none">
      <header className="flex flex-col p-8 items-center">
        <div className="flex flex-row justify-between items-center w-full max-w-screen-2xl">
          <Link to="/" className="flex flex-row gap-2">
            <Castle />
            <h3>Chess Sandbox</h3>
          </Link>
          <Link to="https://github.com/osutaiko/pawn-pulse">
            <Github />
          </Link>
        </div>
      </header>
      <main className="flex flex-grow flex-col px-8 pb-6 items-center">
        <div className="flex w-full max-w-screen-2xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
