
/**
 * Generates a summary from an AI conversation
 * @param conversation The conversation text to summarize
 * @returns A formatted summary
 */
export const generateSummary = async (conversation: string): Promise<string> => {
  // In a real application, this could call an API or use more sophisticated 
  // text processing. For now, we'll use a simple extraction approach.
  
  // Simple extraction of main points
  const lines = conversation.split('\n').filter(line => line.trim().length > 0);
  
  // Try to identify user messages vs AI messages
  const userMessages = lines
    .filter(line => {
      const lowerLine = line.toLowerCase();
      return (
        (lowerLine.includes('user:') || lowerLine.includes('me:') || lowerLine.includes('human:')) ||
        (!lowerLine.includes('ai:') && !lowerLine.includes('assistant:') && line.endsWith('?'))
      );
    })
    .map(line => line.replace(/^(user:|me:|human:)/i, '').trim())
    .filter(line => line.length > 10)
    .slice(0, 5); // Get up to 5 significant user queries
  
  // Extract potential topics from the conversation
  const potentialTopics = extractTopics(conversation);
  
  // Create the README format
  const title = "# Previous AI Conversation Context\n\n";
  
  let mainTopics = "";
  if (userMessages.length > 0 || potentialTopics.length > 0) {
    mainTopics = "## Main Topics Discussed\n";
    
    if (potentialTopics.length > 0) {
      mainTopics += potentialTopics.map(topic => `- ${topic}`).join('\n') + '\n';
    } else {
      mainTopics += userMessages.map(msg => `- ${msg}`).join('\n') + '\n';
    }
    
    mainTopics += '\n';
  } else {
    mainTopics = "## Context\n- Sharing conversation from previous AI chat\n\n";
  }
  
  const instructions = "## Instructions for AI\nPlease consider the above context from my previous conversation when responding to my next queries. I'm continuing a discussion that started in another chat.\n\n";
  
  return title + mainTopics + instructions;
};

/**
 * Attempts to extract main topics from a conversation
 */
const extractTopics = (text: string): string[] => {
  const topics: string[] = [];
  
  // Look for common patterns that might indicate topics
  const techTerms = [
    'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'API', 
    'frontend', 'backend', 'database', 'SQL', 'NoSQL', 'state management',
    'hooks', 'components', 'functions', 'algorithms', 'data structures',
    'performance', 'optimization', 'security', 'authentication', 'authorization'
  ];
  
  // Extract sentences that contain tech terms
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 15);
  
  for (const term of techTerms) {
    const matchingSentences = sentences.filter(s => 
      s.toLowerCase().includes(term.toLowerCase())
    );
    
    if (matchingSentences.length > 0) {
      // Use the term as a topic
      if (!topics.includes(term) && topics.length < 5) {
        topics.push(term);
      }
    }
  }
  
  return topics;
};
