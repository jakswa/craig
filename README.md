# Slack Bot Project

A Slack chatbot with multiple capabilities.

## Project Milestones

1. **Basic Interaction**
   - Bot responds to "hello" messages
   - Set up basic framework for message handling

2. **Reaction Functionality**
   - Bot adds reactions when it sees certain reactions on messages
   - Implement reaction event handling

3. **Matchmaking System**
   - Implements a matchmaking plugin that helps organize activities
   - Automatically manages participant sign-ups through reactions

## Technologies

- Node.js
- Slack Bolt API

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.sample` and fill in your Slack and Anthropic API credentials
4. Start the bot:
   ```
   npm start
   ```

## Features

### Natural Language Responses with Claude
The bot uses Anthropic's Claude AI to generate natural-sounding responses to user messages, particularly for greetings.

### Matchmaking System
A matchmaking plugin that allows users to organize activities by:
- Detecting messages with format "I need X Y for Z" (e.g., "I need 4 racers for gokarts")
- Adding guide reactions (➡️ ✋) to prompt users to join
- Tracking user sign-ups via reactions
- Automatically creating a thread when the required number of participants is reached