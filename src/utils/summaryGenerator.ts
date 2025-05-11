
/**
 * Generates a summary from an AI conversation
 * @param conversation The conversation text to summarize
 * @returns A formatted summary
 */
export const generateSummary = async (conversation: string): Promise<string> => {
  // Extract user and AI messages for more detailed analysis
  const lines = conversation.split('\n').filter(line => line.trim().length > 0);
  
  // Improved detection of user vs AI messages
  const userMessages = extractUserMessages(lines);
  const aiResponses = extractAIResponses(lines);
  
  // Extract key topics with more context
  const potentialTopics = extractTopics(conversation);
  const detectedConcepts = extractConcepts(conversation);
  
  // Extract code snippets if present
  const codeSnippets = extractCodeSnippets(conversation);
  
  // Create the README format with more detailed sections
  const title = "# Previous AI Conversation Context\n\n";
  
  // Create main topics section with more detail
  let mainTopics = "";
  if (potentialTopics.length > 0 || detectedConcepts.length > 0) {
    mainTopics = "## Main Topics Discussed\n";
    
    if (potentialTopics.length > 0) {
      mainTopics += potentialTopics.map(topic => `- ${topic}`).join('\n') + '\n\n';
    }
    
    if (detectedConcepts.length > 0) {
      mainTopics += "### Key Concepts\n" + detectedConcepts.map(concept => `- ${concept}`).join('\n') + '\n\n';
    }
  } else if (userMessages.length > 0) {
    mainTopics = "## Main Questions Asked\n" + 
      userMessages.slice(0, 5).map(msg => `- ${msg}`).join('\n') + '\n\n';
  } else {
    mainTopics = "## Context\n- Sharing conversation from previous AI chat\n\n";
  }
  
  // Add conversation flow section for better context
  let conversationFlow = "";
  if (userMessages.length > 0 && aiResponses.length > 0) {
    conversationFlow = "## Conversation Flow\n";
    
    // Take up to 3 significant exchanges to show progression
    const exchanges = Math.min(3, Math.min(userMessages.length, aiResponses.length));
    for (let i = 0; i < exchanges; i++) {
      conversationFlow += `### Exchange ${i+1}\n`;
      conversationFlow += `**User:** ${userMessages[i].substring(0, 100)}${userMessages[i].length > 100 ? '...' : ''}\n\n`;
      conversationFlow += `**AI:** ${summarizeAIResponse(aiResponses[i])}\n\n`;
    }
  }
  
  // Add code snippets section if relevant
  let codeSection = "";
  if (codeSnippets.length > 0) {
    codeSection = "## Code Context\n";
    codeSnippets.slice(0, 2).forEach((snippet, index) => {
      const language = detectCodeLanguage(snippet);
      codeSection += `### Snippet ${index + 1} (${language})\n`;
      codeSection += "```" + language + "\n";
      codeSection += snippet.substring(0, 300) + (snippet.length > 300 ? "\n// ... (code truncated for brevity)" : "");
      codeSection += "\n```\n\n";
    });
  }
  
  // Add conclusions or outcomes if detectable
  let conclusions = "";
  if (aiResponses.length > 0) {
    const lastResponse = aiResponses[aiResponses.length - 1];
    if (lastResponse.length > 0) {
      conclusions = "## Latest Outcomes\n";
      conclusions += extractKeyPoints(lastResponse).map(point => `- ${point}`).join('\n') + '\n\n';
    }
  }
  
  const instructions = "## Instructions for AI\nPlease consider the above context from my previous conversation when responding to my next queries. I'm continuing a discussion that started in another chat.\n\n";
  
  return title + mainTopics + conversationFlow + codeSection + conclusions + instructions;
};

/**
 * Extracts user messages from conversation lines
 */
const extractUserMessages = (lines: string[]): string[] => {
  return lines
    .filter(line => {
      const lowerLine = line.toLowerCase();
      return (
        (lowerLine.includes('user:') || lowerLine.includes('me:') || lowerLine.includes('human:')) ||
        (!lowerLine.includes('ai:') && !lowerLine.includes('assistant:') && 
        (line.endsWith('?') || (line.length > 15 && !line.startsWith('```'))))
      );
    })
    .map(line => line.replace(/^(user:|me:|human:)/i, '').trim())
    .filter(line => line.length > 10);
};

/**
 * Extracts AI responses from conversation lines
 */
const extractAIResponses = (lines: string[]): string[] => {
  const responses: string[] = [];
  let currentResponse: string[] = [];
  let inAIResponse = false;
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.startsWith('ai:') || lowerLine.startsWith('assistant:')) {
      if (inAIResponse && currentResponse.length > 0) {
        responses.push(currentResponse.join(' '));
        currentResponse = [];
      }
      inAIResponse = true;
      currentResponse.push(line.replace(/^(ai:|assistant:)/i, '').trim());
    } else if (lowerLine.startsWith('user:') || lowerLine.startsWith('human:') || lowerLine.startsWith('me:')) {
      if (inAIResponse && currentResponse.length > 0) {
        responses.push(currentResponse.join(' '));
        currentResponse = [];
      }
      inAIResponse = false;
    } else if (inAIResponse) {
      currentResponse.push(line);
    }
  });
  
  // Don't forget the last response
  if (inAIResponse && currentResponse.length > 0) {
    responses.push(currentResponse.join(' '));
  }
  
  return responses;
};

/**
 * Attempts to extract main topics from a conversation
 */
const extractTopics = (text: string): string[] => {
  const topics: string[] = [];
  
  // Enhanced list of technical terms and domains
  const techTerms = [
    'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'API', 
    'frontend', 'backend', 'database', 'SQL', 'NoSQL', 'state management',
    'hooks', 'components', 'functions', 'algorithms', 'data structures',
    'performance', 'optimization', 'security', 'authentication', 'authorization',
    'GraphQL', 'REST', 'Docker', 'Kubernetes', 'CI/CD', 'testing',
    'refactoring', 'design patterns', 'architecture', 'cloud', 'serverless',
    'AI', 'machine learning', 'natural language processing', 'computer vision',
    'blockchain', 'crypto', 'web3', 'mobile', 'responsive', 'progressive web app',
    'accessibility', 'i18n', 'l10n', 'UX', 'UI'
  ];
  
  // Extract sentences that contain tech terms
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 15);
  
  for (const term of techTerms) {
    const matchingSentences = sentences.filter(s => 
      s.toLowerCase().includes(term.toLowerCase())
    );
    
    if (matchingSentences.length > 0) {
      // Use the term as a topic with additional context if available
      if (!topics.includes(term) && topics.length < 8) {
        const context = matchingSentences[0].trim();
        if (context.length > term.length + 20) {
          // Extract a more meaningful topic phrase containing the term
          const index = context.toLowerCase().indexOf(term.toLowerCase());
          const start = Math.max(0, index - 20);
          const end = Math.min(context.length, index + term.length + 20);
          const topicWithContext = context.substring(start, end)
            .replace(/^[,;\s]+|[,;\s]+$/g, '') // Trim punctuation and spaces
            .replace(/\s+/g, ' '); // Normalize spaces
          topics.push(topicWithContext);
        } else {
          topics.push(term);
        }
      }
    }
  }
  
  return topics;
};

/**
 * Extracts key concepts from the conversation
 */
const extractConcepts = (text: string): string[] => {
  const concepts: string[] = [];
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 20);
  
  // Look for characteristic phrases that often introduce concepts
  const conceptMarkers = [
    'is defined as', 'refers to', 'means', 'is a', 'are', 'describes', 
    'represents', 'denotes', 'consists of', 'comprises'
  ];
  
  for (const sentence of sentences) {
    for (const marker of conceptMarkers) {
      if (sentence.toLowerCase().includes(marker)) {
        // Extract the concept definition
        const parts = sentence.split(new RegExp(`(${marker})`, 'i'), 2);
        if (parts.length >= 2) {
          const concept = parts[0].trim();
          const definition = parts[1].includes(marker) ? 
            parts[2] ? parts[2].trim() : '' : 
            parts[1].trim();
            
          if (concept.length > 3 && concept.length < 40 && definition.length > 10) {
            concepts.push(`${concept} ${marker} ${definition}`);
          }
        }
      }
    }
  }
  
  // Also look for definitions in code comments
  const commentMatches = text.match(/\/\/\s*([^:]+):\s*(.+)/g);
  if (commentMatches) {
    commentMatches.forEach(match => {
      const parts = match.replace('//', '').split(':');
      if (parts.length >= 2) {
        const concept = parts[0].trim();
        const definition = parts.slice(1).join(':').trim();
        if (concept.length > 2 && definition.length > 5) {
          concepts.push(`${concept}: ${definition}`);
        }
      }
    });
  }
  
  return concepts.slice(0, 5); // Limit to 5 most relevant concepts
};

/**
 * Extract code snippets from the conversation
 */
const extractCodeSnippets = (text: string): string[] => {
  const codeSnippets: string[] = [];
  
  // Look for code blocks enclosed in triple backticks
  const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/g;
  let match;
  
  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match[1] && match[1].trim().length > 0) {
      codeSnippets.push(match[1].trim());
    }
  }
  
  // Also check for indented code blocks
  if (codeSnippets.length === 0) {
    const lines = text.split('\n');
    let currentSnippet: string[] = [];
    let inSnippet = false;
    
    for (const line of lines) {
      if (line.startsWith('    ') || line.startsWith('\t')) {
        inSnippet = true;
        currentSnippet.push(line.replace(/^    /, '').replace(/^\t/, ''));
      } else if (inSnippet && line.trim().length === 0) {
        // Empty line, might still be in the snippet
        currentSnippet.push('');
      } else if (inSnippet) {
        // End of snippet
        if (currentSnippet.length > 2) {
          codeSnippets.push(currentSnippet.join('\n'));
        }
        currentSnippet = [];
        inSnippet = false;
      }
    }
    
    // Don't forget the last snippet
    if (inSnippet && currentSnippet.length > 2) {
      codeSnippets.push(currentSnippet.join('\n'));
    }
  }
  
  return codeSnippets;
};

/**
 * Tries to detect the programming language of a code snippet
 */
const detectCodeLanguage = (snippet: string): string => {
  // Simplified language detection based on keywords and syntax
  if (snippet.includes('import React') || snippet.includes('export default') || 
      snippet.includes('const') || snippet.includes('function') || 
      snippet.includes('=>') || snippet.includes('useState')) {
    return 'javascript';
  }
  
  if (snippet.includes('<div') || snippet.includes('</div>') || 
      snippet.includes('<span') || snippet.includes('className=')) {
    return 'jsx';
  }
  
  if (snippet.includes('interface ') || snippet.includes(': string') || 
      snippet.includes(': number') || snippet.includes('<T>')) {
    return 'typescript';
  }
  
  if (snippet.includes('def ') || snippet.includes('import ') && snippet.includes(':') || 
      snippet.includes('class ') && snippet.includes(':')) {
    return 'python';
  }
  
  if (snippet.includes('{') && snippet.includes('}') && 
      (snippet.includes(';') || snippet.includes('public '))) {
    return 'java';
  }
  
  // Default to plain text if we can't determine the language
  return 'text';
};

/**
 * Creates a brief summary of an AI response
 */
const summarizeAIResponse = (response: string): string => {
  if (!response || response.length === 0) return 'No response';
  
  if (response.length <= 100) return response;
  
  // For longer responses, extract the first sentence and try to find key actions
  const firstSentence = response.split(/[.!?]/)[0].trim();
  
  // Look for action verbs and technical terms to highlight what the AI did
  const actionVerbs = ['created', 'implemented', 'modified', 'updated', 'fixed', 'added', 'removed', 'refactored', 'explained'];
  
  let summary = firstSentence;
  
  // Try to extract what the AI actually did
  for (const verb of actionVerbs) {
    const verbIndex = response.toLowerCase().indexOf(verb.toLowerCase());
    if (verbIndex >= 0) {
      const sentenceStart = Math.max(0, response.lastIndexOf('.', verbIndex) + 1);
      const sentenceEnd = response.indexOf('.', verbIndex);
      
      if (sentenceEnd > sentenceStart) {
        const actionSentence = response.substring(sentenceStart, sentenceEnd + 1).trim();
        if (actionSentence.length > 10 && actionSentence.length < 150) {
          summary += ' ' + actionSentence;
          break;
        }
      }
    }
  }
  
  return summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
};

/**
 * Extract key points from the final AI response
 */
const extractKeyPoints = (response: string): string[] => {
  const keyPoints: string[] = [];
  
  // Look for bullet points
  const bulletPointsRegex = /[-*•]\s+([^\n]+)/g;
  let match;
  
  while ((match = bulletPointsRegex.exec(response)) !== null) {
    if (match[1] && match[1].trim().length > 10) {
      keyPoints.push(match[1].trim());
    }
  }
  
  // If no bullet points found, try to extract sentences with important markers
  if (keyPoints.length === 0) {
    const sentences = response.split(/[.!?]/).filter(s => s.trim().length > 20);
    
    const importantMarkers = [
      'important', 'key', 'essential', 'critical', 'crucial',
      'result', 'outcome', 'achieved', 'completed', 'finished',
      'recommended', 'suggested', 'advised', 'proposed'
    ];
    
    for (const sentence of sentences) {
      for (const marker of importantMarkers) {
        if (sentence.toLowerCase().includes(marker.toLowerCase())) {
          keyPoints.push(sentence.trim());
          break;
        }
      }
      
      if (keyPoints.length >= 3) break;
    }
  }
  
  // If still no key points, take the first few sentences
  if (keyPoints.length === 0) {
    const sentences = response.split(/[.!?]/).filter(s => s.trim().length > 20);
    keyPoints.push(...sentences.slice(0, 2).map(s => s.trim()));
  }
  
  return keyPoints.slice(0, 5); // Limit to 5 key points
};

