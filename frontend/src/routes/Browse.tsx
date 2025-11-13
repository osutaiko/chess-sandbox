import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Variant } from "@/lib/types"; // Assuming Variant type is defined here

const Browse = () => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/variants');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Variant[] = await response.json();
        setVariants(data);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch variants');
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, []);

  if (loading) {
    return <div className="p-4">Loading variants...</div>;
  }

  if (error) {
    return <div className="p-4 text-destructive">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Browse Variants</h1>
      {variants.length === 0 ? (
        <p>No variants available. Create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {variants.map((variant) => (
            <Link to={`/play/${variant.id}`} state={{ variant }} key={variant.id}>
              <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <h2 className="text-xl font-semibold">{variant.name}</h2>
                <p className="text-gray-600">{variant.description}</p>
                {/* Add more variant details here if needed */}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;