
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Copy, Check } from "lucide-react";
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
      // Generate the OpenAI-powered summary
      const summaryText = await generateSummary(inputText);
      setSummary(summaryText);
      
      toast({
        title: "AI summary created!",
        description: "Your conversation has been analyzed and summarized",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-8 pt-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">AI Context Sharer</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transfer context between AI conversations with intelligent summaries powered by OpenAI
          </p>
        </header>

        <Card className="w-full shadow-lg border-blue-100 overflow-hidden">
          <div className="p-6 bg-white rounded-t-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-700 font-bold">1</div>
                  <h2 className="text-xl font-semibold text-gray-800">Paste your AI conversation</h2>
                </div>
                
                <Textarea 
                  placeholder="Copy and paste your conversation with an AI assistant here..."
                  className="min-h-[280px] text-sm border-blue-200 focus:border-blue-400"
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
                      <span>Generating summary...</span>
                    </div>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate AI Summary
                    </>
                  )}
                </Button>
              </div>
              
              {/* Output Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-700 font-bold">2</div>
                  <h2 className="text-xl font-semibold text-gray-800">Get your AI-powered summary</h2>
                </div>
                
                <SummaryDisplay 
                  summary={summary || ''}
                  copied={copied}
                  onCopy={copyToClipboard}
                  isLoading={loading}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 border-t border-blue-100">
            <div className="text-sm text-blue-700 text-center max-w-2xl mx-auto">
              <p>Your conversations are analyzed by OpenAI to create comprehensive summaries capturing key topics, code snippets, and conversation flow.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
