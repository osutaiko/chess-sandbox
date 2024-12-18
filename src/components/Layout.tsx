import { Outlet, Link } from "react-router-dom";

import { Castle, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const Layout = () => {
  return (
    <div className="flex flex-col items-center min-h-screen select-none">
      <header className="flex flex-row px-4 md:px-8 py-4 justify-between items-center w-full border-b bg-secondary/30">
        <Link to="/" className="flex flex-row items-center gap-5">
          <Castle />
          <h3 className="hidden sm:block">Chess Sandbox</h3>
        </Link>
        <div className="flex flex-row items-center gap-8">
          <Link to="/create" className="flex flex-row gap-2">
            <Button variant="link" className="p-0 h-min">Create</Button>
          </Link>
          <Link to="/browse" className="flex flex-row gap-2">
            <Button variant="link" className="p-0 h-min">Browse</Button>
          </Link>
          <Link to="https://github.com/osutaiko/chess-sandbox">
            <Github />
          </Link>
        </div>
      </header>
      <main className="flex flex-grow justify-center overflow-hidden w-full max-w-screen-2xl">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
