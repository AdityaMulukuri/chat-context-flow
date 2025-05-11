
import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import LoadingSpinner from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface SummaryDisplayProps {
  summary: string;
  copied: boolean;
  onCopy: () => void;
  isLoading?: boolean;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ 
  summary, 
  copied, 
  onCopy, 
  isLoading = false 
}) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  
  // Apply markdown styling
  useEffect(() => {
    if (summaryRef.current && summary) {
      // Very basic markdown rendering
      let formattedContent = summary
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```(\w*)\n([\s\S]*?)```/gm, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/^\- (.*$)/gm, '<ul><li>$1</li></ul>');
      
      summaryRef.current.innerHTML = formattedContent;
    }
  }, [summary]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-10 bg-gray-50 border border-blue-100 rounded-md h-[280px]">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-blue-700">Creating your AI-powered summary...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div 
        ref={summaryRef}
        className={cn(
          "bg-gray-50 p-4 rounded-md border border-blue-100 text-sm text-gray-700 min-h-[280px] overflow-y-auto mb-2 markdown-content",
          !summary && "flex items-center justify-center text-gray-400"
        )}
      >
        {!summary ? (
          <div className="text-center p-4">
            <p className="mb-2">Your AI-generated summary will appear here</p>
            <p className="text-xs text-gray-400">Contains key topics, code snippets, and conversation flow</p>
          </div>
        ) : null}
      </div>
      
      <Button
        onClick={onCopy}
        disabled={!summary}
        variant="outline"
        className={cn(
          "flex gap-2 items-center justify-center",
          copied ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        )}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied to clipboard!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy summary to clipboard
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center mt-1">
        Paste this summary into your next AI chat to provide context
      </p>
    </div>
  );
};

export default SummaryDisplay;
