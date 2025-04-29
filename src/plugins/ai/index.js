const { generateResponse } = require('../../services/claude');

async function handleMention({ event, say, client }) {
  try {
    // Get bot info to identify its own mentions
    const botInfo = await client.auth.test();
    const botUserId = botInfo.user_id;
    
    // Get the last 5 messages for context
    const result = await client.conversations.history({
      channel: event.channel,
      limit: 5
    });
    
    // Format messages for Claude
    const formattedMessages = result.messages.reverse().map(msg => {
      const isBot = msg.bot_id ? true : false;
      // Add user ID to the content to preserve who's speaking
      const senderPrefix = (!isBot && msg.user) ? `<@${msg.user}>: ` : '';
      return {
        role: isBot ? 'assistant' : 'user',
        content: senderPrefix + msg.text
      };
    });

    // Create system prompt
    const systemPrompt = `You are Craig, a helpful Slack bot. In this conversation, your user ID appears as <@${botUserId}>.
      When users mention you with <@${botUserId}> in their messages, they're directly addressing you.
      Other users have their own user IDs.
      User messages will be prefixed with their Slack ID like "<@34298374>: message text". 
      When responding to a specific user, mention them using their ID (e.g., "Hey <@34298374>, ...").
      Respond in a friendly, helpful, and concise manner. Keep your responses conversational
      and natural, as if you're a team member in the Slack channel.`;
    
    // Get AI-generated response
    const response = await generateResponse(null, {
      messages: formattedMessages,
      system: systemPrompt
    });
    
    await say(response);
  } catch (error) {
    console.error(`Error responding to mention: ${error}`);
    await say(`Hello <@${event.user}>! I'm having trouble processing your request right now.`);
  }
}

module.exports = {
  registerPlugin: (app) => {
    app.event('app_mention', handleMention);
  }
};