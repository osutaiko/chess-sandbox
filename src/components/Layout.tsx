import { Outlet, Link } from "react-router-dom";

import { Castle, Github } from "lucide-react";
import { Button } from "./ui/button";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen select-none">
      <header className="flex flex-row px-8 py-6 justify-between items-center w-full border-b h-[72px]">
        <Link to="/" className="flex flex-row gap-4">
          <Castle />
          <h3>Chess Sandbox</h3>
        </Link>
        <div className="flex flex-row items-center gap-10">
          <Link to="/create" className="flex flex-row gap-2">
            <Button variant="link" className="p-0 h-min">Create</Button>
          </Link>
          <Link to="/browse" className="flex flex-row gap-2">
            <Button variant="link" className="p-0 h-min">Browse</Button>
          </Link>
          <Link to="https://github.com/osutaiko/pawn-pulse">
            <Github />
          </Link>
        </div>
      </header>
      <main className="flex-grow overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
