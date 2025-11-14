import { useState } from "react";
import { Link } from "react-router-dom";

import { Variant } from "common";
import { VARIANT_PRESETS } from "@/lib/variantPresets";

import Chessboard from "@/components/Chessboard";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [variant] = useState<Variant>(
    structuredClone(VARIANT_PRESETS[Math.floor(Math.random() * VARIANT_PRESETS.length)])
  );

  return (
    <div className="flex flex-col items-center md:px-8 py-6 md:py-12 w-full">
      <div className="flex flex-col items-center gap-2 md:gap-4">
        <h2 className="text-base sm:text-xl md:text-2xl">Welcome to Chess Sandbox</h2>
        <p className="px-4 text-center">Create, browse, and play user-made fairy chess variants</p>
      </div>

      <div className="max-w-[500px] mt-8 md:mt-12 flex items-center justify-center">
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '100%', maxHeight: '100%', aspectRatio: `${variant.width} / ${variant.height}` }}>
            <Chessboard variant={variant} isInteractable={false} />
          </div>
        </div>
      </div>

      <div className="flex flex-col mt-4 md:mt-8 md:flex-row items-center gap-1">
        <Link to="/create">
          <Button>Start crafting your own fairy chess game</Button>
        </Link>
        <Link to="/browse">
          <Button variant="secondary">Browse user variants to play with a friend</Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
