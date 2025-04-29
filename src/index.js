require('dotenv').config();
const { App } = require('@slack/bolt');

// Initialize the Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// Milestone 1: Bot responds to hello
app.message('hello', async ({ message, say }) => {
  await say(`Hello there <@${message.user}>!`);
});

// Milestone 2: Bot adds reactions when it sees certain reactions
app.event('reaction_added', async ({ event, client }) => {
  try {
    // For demonstration, we'll mirror the reaction that was added
    // This can be customized based on specific reactions you want to respond to
    if (event.item.type === 'message') {
      await client.reactions.add({
        channel: event.item.channel,
        timestamp: event.item.ts,
        name: event.reaction
      });
    }
  } catch (error) {
    console.error(error);
  }
});

// Milestone 3: Queueing Plugin (placeholder)
// To be implemented based on requirements

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Slack bot is running!');
})();