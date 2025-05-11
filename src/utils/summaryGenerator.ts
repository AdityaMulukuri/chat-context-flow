
import { generateOpenAISummary } from "../services/openAiService";

/**
 * Generates a summary from an AI conversation
 * @param conversation The conversation text to summarize
 * @returns A formatted summary
 */
export const generateSummary = async (conversation: string): Promise<string> => {
  try {
    // Use OpenAI to generate a high-quality summary
    const { summary, error } = await generateOpenAISummary(conversation);
    
    if (error) {
      throw new Error(error);
    }
    
    return summary;
  } catch (error) {
    console.error("Error in summary generation:", error);
    
    // Return a simple fallback summary if API fails
    return `# Previous AI Conversation Context\n\n## Context\n- Sharing conversation from previous AI chat\n\n## Instructions for AI\nPlease consider the above context from my previous conversation when responding to my next queries. I'm continuing a discussion that started in another chat.`;
  }
};
