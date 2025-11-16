import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { VARIANT_PRESETS } from "@/lib/variantPresets";

import { Variant } from "common";
import { parse } from "common/json";

import Chessboard from "@/components/Chessboard";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const BrowseCatalog = () => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserVariants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:3001/api/variants');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Variant[] = parse(await response.text());
        setVariants(data);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch user variants');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserVariants();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading variants...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-full text-destructive">Error: {error}</div>;
  }

  return (
    <div className="w-full px-4 md:px-8 py-6 md:py-8">
      {/* Official Variants Section */}
      <h2 className="text-2xl font-bold mb-4">Official Variants</h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border-none">
        <div className="flex w-max space-x-4 p-4">
          {VARIANT_PRESETS.map((variant) => (
            <Link to={`/browse/${variant.id}`} key={variant.id}>
              <div className="p-4 transition-shadow cursor-pointer flex flex-col items-center">
                <h2 className="text-xl font-normal mb-4 text-center truncate w-[300px]">{variant.name}</h2>
                <div className="w-[300px] h-[300px] flex items-center justify-center">
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '100%', maxHeight: '100%', aspectRatio: `${variant.width} / ${variant.height}` }}>
                      <Chessboard variant={variant} isInteractable={false} showLabels={false} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>

      <Separator className="my-8 h-[0.5px]" />

      {/* User Variants Section */}
      <h2 className="text-2xl font-bold mb-4 mt-8">User Variants</h2>
      {variants.length === 0 ? (
        <p>No user-created variants available. Create one!</p>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {variants.map((variant) => (
            <Link to={`/browse/${variant.id}`} key={variant.id}>
              <div className="p-4 transition-shadow cursor-pointer flex flex-col items-center">
                <h2 className="text-xl font-normal mb-4 text-center truncate w-[300px]">{variant.name}</h2>
                <div className="w-[300px] h-[300px] flex items-center justify-center">
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '100%', maxHeight: '100%', aspectRatio: `${variant.width} / ${variant.height}` }}>
                      <Chessboard variant={variant} isInteractable={false} showLabels={false} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseCatalog;
