
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface SummaryDisplayProps {
  summary: string;
  copied: boolean;
  onCopy: () => void;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, copied, onCopy }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm text-gray-700 max-h-[200px] overflow-y-auto mb-2 whitespace-pre-wrap">
        {summary}
      </div>
      
      <Button
        onClick={onCopy}
        className="flex gap-2 items-center justify-center bg-indigo-600 hover:bg-indigo-700"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied to clipboard!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy to clipboard
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center mt-2">
        Paste this summary into your next AI chat to provide context
      </p>
    </div>
  );
};

export default SummaryDisplay;
