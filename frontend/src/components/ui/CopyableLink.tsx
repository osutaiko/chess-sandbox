import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Check, Copy } from "lucide-react";

interface CopyableLinkProps {
  shareUrl?: string;
}

export function CopyableLink({ shareUrl }: CopyableLinkProps) {
  const [isCopied, setIsCopied] = useState(false);
  const link = shareUrl || window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-secondary rounded-md p-4 text-center">
      <p className="mb-4">
        Send this link to play with someone else; the first person to join will play with you.
      </p>
      <div className="flex w-full max-w-sm items-center gap-1">
        <Input type="text" value={link} readOnly />
        <Button onClick={handleCopy} size="icon">
          {isCopied ? <Check size={16} /> : <Copy size={16} />}
        </Button>
      </div>
    </div>
  );
}
