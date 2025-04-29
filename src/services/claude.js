const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate a response using Claude
 * @param {string} prompt - The prompt to send to Claude
 * @param {object} options - Options for the Claude API
 * @returns {Promise<string>} - The generated response
 */
async function generateResponse(prompt, options = {}) {
  try {
    const defaultOptions = {
      model: 'claude-3-haiku-20240307',
      maxTokens: 1000,
      temperature: 0.7,
    };

    const mergedOptions = { ...defaultOptions, ...options };

    const message = await anthropic.messages.create({
      model: mergedOptions.model,
      max_tokens: mergedOptions.maxTokens,
      temperature: mergedOptions.temperature,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Error generating response from Claude:', error);
    return 'Sorry, I encountered an error while processing your request.';
  }
}

module.exports = { generateResponse };