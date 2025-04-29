require('dotenv').config();
const { App } = require('@slack/bolt');
const { generateResponse } = require('./services/claude');
const { parseMatchmakingRequest, initializeMatchmaking, handleMatchmakingReaction } = require('./services/matchmaking');

// Initialize the Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// Milestone 1: Bot responds to @mentions with AI-generated responses
app.event('app_mention', async ({ event, say, client }) => {
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
});

app.event('message', async ({ event, client }) => {
  try {
    // Skip if it's not a regular message or if it's from a bot
    if (event.subtype || event.bot_id) return;
    
    // Check if this is a matchmaking request
    const matchRequest = parseMatchmakingRequest(event.text);
    if (matchRequest) {
      await initializeMatchmaking(client, event, matchRequest);
    }
  } catch (error) {
    console.error('Error handling message for matchmaking:', error);
  }
});

// Update the reaction_added event to handle matchmaking reactions
app.event('reaction_added', async ({ event, client }) => {
  await handleMatchmakingReaction(client, event);
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Slack bot is running!');
})();
