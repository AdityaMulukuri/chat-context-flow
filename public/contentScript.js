
// This script runs in the context of web pages

// Function to identify which AI platform we're on
function identifyPlatform() {
  const url = window.location.href;
  
  if (url.includes('chat.openai.com')) return 'chatgpt';
  if (url.includes('claude.ai')) return 'claude';
  if (url.includes('gemini.google.com')) return 'gemini';
  if (url.includes('perplexity.ai')) return 'perplexity';
  if (url.includes('cursor.sh')) return 'cursor';
  if (url.includes('v0.dev')) return 'v0';
  
  return 'unknown';
}

// Extract conversation based on AI platform
function extractConversation() {
  const platform = identifyPlatform();
  let conversationText = '';
  
  switch (platform) {
    case 'chatgpt':
      // ChatGPT conversation extraction
      const chatgptMessages = document.querySelectorAll('div[data-message-author-role]');
      chatgptMessages.forEach(message => {
        const role = message.getAttribute('data-message-author-role');
        const content = message.querySelector('div[data-message-text]')?.textContent || '';
        if (content) {
          conversationText += `${role === 'user' ? 'User' : 'Assistant'}: ${content}\n\n`;
        }
      });
      break;
      
    case 'claude':
      // Claude conversation extraction
      const claudeMessages = document.querySelectorAll('.message');
      claudeMessages.forEach(message => {
        const isUser = message.classList.contains('user-message');
        const content = message.textContent || '';
        if (content) {
          conversationText += `${isUser ? 'User' : 'Assistant'}: ${content}\n\n`;
        }
      });
      break;
      
    case 'gemini':
      // Gemini conversation extraction
      const geminiMessages = document.querySelectorAll('.chat-message');
      geminiMessages.forEach(message => {
        const isUser = message.classList.contains('user-message');
        const content = message.querySelector('.content')?.textContent || '';
        if (content) {
          conversationText += `${isUser ? 'User' : 'Assistant'}: ${content}\n\n`;
        }
      });
      break;
      
    case 'perplexity':
      // Perplexity conversation extraction
      const perplexityMessages = document.querySelectorAll('.message-container');
      perplexityMessages.forEach(message => {
        const isUser = message.classList.contains('user-message');
        const content = message.querySelector('.message-content')?.textContent || '';
        if (content) {
          conversationText += `${isUser ? 'User' : 'Assistant'}: ${content}\n\n`;
        }
      });
      break;
      
    default:
      // Generic extraction attempt
      const allText = document.body.innerText;
      conversationText = allText.substring(0, 15000); // Limit to reasonable size
      break;
  }
  
  return conversationText;
}

// Function to paste content into a chat input
function pasteIntoChat(summary) {
  const platform = identifyPlatform();
  let inputField = null;
  
  switch (platform) {
    case 'chatgpt':
      inputField = document.querySelector('#prompt-textarea');
      break;
      
    case 'claude':
      inputField = document.querySelector('textarea[placeholder="Message Claude…"]');
      break;
      
    case 'gemini':
      inputField = document.querySelector('textarea[placeholder="Enter your message..."]');
      break;
      
    case 'perplexity':
      inputField = document.querySelector('.message-input');
      break;
      
    default:
      // Try generic selectors
      inputField = document.querySelector('textarea') || 
                   document.querySelector('[contenteditable="true"]') ||
                   document.querySelector('input[type="text"]');
      break;
  }
  
  if (inputField) {
    // Focus the input field
    inputField.focus();
    
    // Set its value directly if it's a regular input or textarea
    if (inputField.tagName === 'TEXTAREA' || inputField.tagName === 'INPUT') {
      inputField.value = summary;
      // Trigger input event to ensure the UI updates
      inputField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Handle contentEditable elements
    else if (inputField.getAttribute('contenteditable') === 'true') {
      inputField.innerHTML = summary;
      // Trigger input event
      inputField.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractConversation') {
    const conversation = extractConversation();
    sendResponse({ conversation });
  } else if (request.action === 'pasteIntoChat') {
    pasteIntoChat(request.summary);
    sendResponse({ success: true });
  }
  return true; // Required for asynchronous response
});
