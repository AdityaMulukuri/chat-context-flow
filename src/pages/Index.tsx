
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import SummaryDisplay from '@/components/SummaryDisplay';
import { useToast } from "@/hooks/use-toast";
import { generateSummary } from '@/utils/summaryGenerator';
import LoadingSpinner from '@/components/LoadingSpinner';

const Index = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No content to summarize",
        description: "Please paste some conversation text first",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate the detailed summary
      const summaryText = await generateSummary(inputText);
      setSummary(summaryText);
      
      toast({
        title: "Detailed summary created!",
        description: "Your AI conversation has been analyzed and summarized",
      });
    } catch (error) {
      console.error("Error summarizing:", error);
      toast({
        title: "Error creating summary",
        description: "Please try again with different content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!summary) return;
    
    navigator.clipboard.writeText(summary)
      .then(() => {
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Summary copied to clipboard",
        });
        
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Error copying to clipboard:", err);
        toast({
          title: "Error copying",
          description: "Please try again or select and copy manually",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-3xl p-5 shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2 text-blue-700">AI Context Sharer</h1>
        <p className="text-gray-600 text-center mb-4 text-sm">
          Share detailed context between AI conversations easily
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input Section */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-blue-600">Step 1: Paste your AI conversation</h2>
            <Textarea 
              placeholder="Paste your conversation with an AI here..."
              className="min-h-[200px] text-sm"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <Button 
              onClick={handleSummarize} 
              disabled={loading || !inputText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Generating detailed summary...</span>
                </div>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Detailed Summary
                </>
              )}
            </Button>
          </div>
          
          {/* Output Section */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-blue-600">Step 2: Get your detailed summary</h2>
            
            <SummaryDisplay 
              summary={summary || ''}
              copied={copied}
              onCopy={copyToClipboard}
              isLoading={loading}
            />
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="text-sm text-gray-500 text-center">
          <p>Our AI analyzes your conversation to create a comprehensive summary with key topics, code snippets, and conversation flow.</p>
        </div>
      </Card>
    </div>
  );
};

export default Index;
