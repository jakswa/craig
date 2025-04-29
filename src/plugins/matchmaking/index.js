const matchRegex = /(?:i|[^ ]+) needs? (\d+) (\w+)(?: for| to) (.+)/i;

/**
 * MatchmakingState tracks the current matchmaking activities
 * Key: message timestamp
 * Value: {
 *   channel: string,
 *   requiredCount: number,
 *   role: string, 
 *   activity: string,
 *   participants: [{userId: string}],
 *   requesterId: string
 * }
 */
const activeMatchmaking = new Map();

/**
 * Check if a message is a matchmaking request
 * @param {string} text - Message text to check
 * @returns {object|null} - Matchmaking details or null if not a matchmaking request
 */
function parseMatchmakingRequest(text) {
  const match = text.match(matchRegex);
  if (!match) return null;

  return {
    requiredCount: parseInt(match[1], 10),
    role: match[2],
    activity: match[3].trim()
  };
}

/**
 * Create a Mario Kart matchmaking session
 * @param {object} client - Slack client
 * @param {object} body - Command body
 * @returns {Promise<void>}
 */
async function handleMarioCommand({ command, client, ack, say }) {
  try {
    // Acknowledge the command
    await ack();
    
    // Post a visible message in the channel
    const result = await say({
      text: `<@${command.user_id}> needs 4 racers for Mario Kart`
    });
    
    // Initialize matchmaking with the posted message
    if (result && result.ts) {
      const matchRequest = {
        requiredCount: 4,
        role: 'racers',
        activity: 'Mario Kart'
      };
      
      // Add reactions to the message
      await client.reactions.add({
        channel: command.channel_id,
        timestamp: result.ts,
        name: 'arrow_right'
      });
      
      await client.reactions.add({
        channel: command.channel_id,
        timestamp: result.ts,
        name: 'hand'
      });
      
      // Store this matchmaking session
      activeMatchmaking.set(result.ts, {
        channel: command.channel_id,
        requiredCount: matchRequest.requiredCount,
        role: matchRequest.role,
        activity: matchRequest.activity,
        participants: [{ userId: command.user_id }],
        requesterId: command.user_id
      });
    }
  } catch (error) {
    console.error('Error handling /mario command:', error);
  }
}

/**
 * Initialize a new matchmaking session
 * @param {object} client - Slack client
 * @param {object} event - Message event
 * @param {object} matchRequest - Parsed match request
 */
async function initializeMatchmaking(client, event, matchRequest) {
  try {
    // Add the initial reactions to guide users
    await client.reactions.add({
      channel: event.channel,
      timestamp: event.ts,
      name: 'arrow_right'
    });
    
    await client.reactions.add({
      channel: event.channel,
      timestamp: event.ts,
      name: 'hand'
    });

    const needer = event.text.match(/<@(\w+)> need/i);
    const initialUser = needer ? needer[1] : event.user;

    // Store this matchmaking session
    activeMatchmaking.set(event.ts, {
      channel: event.channel,
      requiredCount: matchRequest.requiredCount,
      role: matchRequest.role,
      activity: matchRequest.activity,
      participants: [{ userId: initialUser }],
      requesterId: event.user
    });
  } catch (error) {
    console.error('Error initializing matchmaking:', error);
  }
}

/**
 * Handle a user joining a matchmaking session via reaction
 * @param {object} client - Slack client
 * @param {object} event - Reaction event
 */
async function handleMatchmakingReaction(client, event) {
  if (event.reaction !== 'hand') return;
  
  // Check if this is for an active matchmaking
  const matchmaking = activeMatchmaking.get(event.item.ts);
  if (!matchmaking) return;

  // Skip if user already joined
  if (!matchmaking.participants.some(p => p.userId === event.user)) {
    // Add user to participants
    matchmaking.participants.push({
      userId: event.user,
    });
  }

  // Check if we've reached the required count
  if (matchmaking.participants.length >= matchmaking.requiredCount) {
    await completeMatchmaking(client, event.item.ts, matchmaking);
  }
}

/**
 * Complete a matchmaking session by posting in thread
 * @param {object} client - Slack client
 * @param {string} messageTs - Original message timestamp
 * @param {object} matchmaking - Matchmaking session data
 */
async function completeMatchmaking(client, messageTs, matchmaking) {
  try {
    // Format the participants list
    const participantsList = matchmaking.participants
      .map(p => `<@${p.userId}>`)
      .join(', ');

    // Post completion message in thread
    await client.chat.postMessage({
      channel: matchmaking.channel,
      thread_ts: messageTs,
      text: `${matchmaking.activity} is on! ${matchmaking.role}: ${participantsList}`
    });

    // Remove from active matchmaking
    activeMatchmaking.delete(messageTs);
  } catch (error) {
    console.error('Error completing matchmaking:', error);
  }
}

async function handleMessage({ event, client }) {
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
}

module.exports = {
  registerPlugin: (app) => {
    app.event('message', handleMessage);
    app.event('reaction_added', async ({ event, client }) => {
      await handleMatchmakingReaction(client, event);
    });
    app.command('/mario', handleMarioCommand);
  }
};
