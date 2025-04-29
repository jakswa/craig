# Slack Bot Project

A Slack chatbot with multiple capabilities.

## Project Milestones

1. **Basic Interaction**
   - Bot responds to "hello" messages
   - Set up basic framework for message handling

2. **Reaction Functionality**
   - Bot adds reactions when it sees certain reactions on messages
   - Implement reaction event handling

3. **Queueing System**
   - Implement a queueing plugin with specific requirements (to be defined)
   - Create commands for queue management

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