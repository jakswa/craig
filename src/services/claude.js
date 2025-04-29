const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate a response using Claude
 * @param {string|null} prompt - The prompt to send to Claude, or null if using message array
 * @param {object} options - Options for the Claude API
 * @returns {Promise<string>} - The generated response
 */
async function generateResponse(prompt, options = {}) {
  try {
    const defaultOptions = {
      model: 'claude-3-haiku-20240307',
      maxTokens: 1000,
      temperature: 0.7,
      messages: null,
      system: null
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    // Determine which messages format to use
    let messages;
    if (mergedOptions.messages) {
      messages = mergedOptions.messages;
    } else if (prompt) {
      messages = [{ role: 'user', content: prompt }];
    } else {
      throw new Error('Either prompt or messages must be provided');
    }

    // Create request object
    const requestOptions = {
      model: mergedOptions.model,
      max_tokens: mergedOptions.maxTokens,
      temperature: mergedOptions.temperature,
      messages: messages,
    };
    
    // Add system parameter if provided
    if (mergedOptions.system) {
      requestOptions.system = mergedOptions.system;
    }
    
    const message = await anthropic.messages.create(requestOptions);

    return message.content[0].text;
  } catch (error) {
    console.error('Error generating response from Claude:', error);
    return 'Sorry, I encountered an error while processing your request.';
  }
}

module.exports = { generateResponse };