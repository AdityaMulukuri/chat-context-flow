
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ToastContainer } from "@/components/ExtensionToast";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy, FileText, Share2 } from "lucide-react";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load any saved summary from storage
    chrome.storage.local.get(['chatSummary'], (result) => {
      if (result.chatSummary) {
        setSummary(result.chatSummary);
      }
    });
  }, []);

  const captureChat = async () => {
    setLoading(true);
    
    try {
      // Get the active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (!activeTab.id) {
        throw new Error("No active tab found");
      }
      
      // Extract conversation from the page
      const response = await chrome.tabs.sendMessage(activeTab.id, { action: 'extractConversation' });
      
      if (response && response.conversation) {
        // Show summarizing state
        setSummarizing(true);
        setLoading(false);
        
        // Create a summary
        const summaryText = await generateSummary(response.conversation);
        
        setSummary(summaryText);
        setSummarizing(false);
        
        // Save to storage
        chrome.storage.local.set({ chatSummary: summaryText });
        
        toast({
          title: "Chat captured!",
          description: "Summary generated and ready to share",
        });
      } else {
        throw new Error("Could not extract conversation");
      }
    } catch (error) {
      console.error("Error capturing chat:", error);
      toast({
        title: "Error capturing chat",
        description: "Please make sure you're on a supported AI chat page",
        variant: "destructive",
      });
      setLoading(false);
      setSummarizing(false);
    }
  };

  const pasteIntoChat = async () => {
    if (!summary) return;
    
    setLoading(true);
    
    try {
      // Get the active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (!activeTab.id) {
        throw new Error("No active tab found");
      }
      
      // Send the summary to the content script for pasting
      await chrome.tabs.sendMessage(activeTab.id, { 
        action: 'pasteIntoChat', 
        summary: summary 
      });
      
      toast({
        title: "Context shared!",
        description: "Summary pasted into the current chat",
      });
    } catch (error) {
      console.error("Error pasting into chat:", error);
      toast({
        title: "Error sharing context",
        description: "Please make sure you're on a supported AI chat page",
        variant: "destructive",
      });
    }
    
    setLoading(false);
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
          description: "Please try again",
          variant: "destructive",
        });
      });
  };

  // Function to generate a summary of the conversation
  // This is a simple implementation - would be better with a proper AI model
  const generateSummary = async (conversation: string): Promise<string> => {
    // Simulate AI processing time for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple extraction of main points - in a real implementation,
    // you would use a proper summarization algorithm or API
    const lines = conversation.split('\n').filter(line => line.trim().length > 0);
    const userQueries = lines.filter(line => line.startsWith('User:'))
                            .map(line => line.replace('User:', '').trim())
                            .filter(line => line.length > 10)
                            .slice(0, 5); // Get up to 5 significant user queries
    
    // Create the README format
    const title = "# Previous AI Conversation Context\n\n";
    const mainTopics = userQueries.length > 0
      ? "## Main Topics Discussed\n" + userQueries.map(q => `- ${q}`).join('\n') + '\n\n'
      : "## Context\n- Sharing conversation from another AI chat\n\n";
    
    const instructions = "## Instructions for AI\nPlease consider the above context from my previous conversation when responding to my next queries. I'm continuing a discussion that started in another chat.\n\n";
    
    return title + mainTopics + instructions;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-80 p-5 shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2 text-blue-700">AI Context Sharer</h1>
        <p className="text-gray-600 text-center mb-4 text-sm">
          Capture and share context between AI chats
        </p>
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={captureChat} 
            disabled={loading || summarizing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {summarizing ? (
              <>Summarizing...</>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Capture Current Chat
              </>
            )}
          </Button>
          
          {summary && (
            <>
              <Separator className="my-2" />
              
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm text-gray-700 max-h-32 overflow-y-auto mb-2">
                <pre className="whitespace-pre-wrap">{summary.substring(0, 150)}...</pre>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={pasteIntoChat}
                  disabled={loading || !summary}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Paste into Chat
                </Button>
                
                <Button
                  onClick={copyToClipboard}
                  disabled={!summary}
                  variant="outline"
                  className="px-3"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          Works with ChatGPT, Claude, Gemini, Perplexity & more
        </div>
      </Card>
      
      <ToastContainer />
    </div>
  );
};

export default Index;
