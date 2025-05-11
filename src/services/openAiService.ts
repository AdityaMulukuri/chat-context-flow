
/**
 * Service for interacting with OpenAI API
 */

// This is a temporary API key, in a production app you should store this securely
// and not expose it in client-side code
const OPENAI_API_KEY = "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";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export type OpenAIResponse = {
  summary: string;
  error?: string;
};

/**
 * Generate a conversation summary using OpenAI's API
 */
export const generateOpenAISummary = async (conversation: string): Promise<OpenAIResponse> => {
  try {
    const systemPrompt = `
      You are an AI assistant that creates detailed summaries of conversations between users and AI assistants.
      Your task is to analyze the conversation text provided and create a comprehensive, well-structured summary that includes:
      
      1. Main topics and key concepts discussed
      2. Important code snippets (if any)
      3. The conversation flow and progression
      4. Conclusions or outcomes
      
      Format the summary in Markdown with clear sections, bullet points, and code blocks where appropriate.
      The summary should be detailed enough to provide excellent context for continuing the conversation with a new AI assistant.
      Start with "# Previous AI Conversation Context" and include relevant sections.
    `;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Here's the conversation to summarize: \n\n${conversation}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to generate summary");
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;
    
    return { summary };
  } catch (error) {
    console.error("Error generating OpenAI summary:", error);
    return { 
      summary: "", 
      error: error instanceof Error ? error.message : "Failed to generate summary" 
    };
  }
};
