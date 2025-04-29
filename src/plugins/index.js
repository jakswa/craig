const aiPlugin = require('./ai');
const matchmakingPlugin = require('./matchmaking');

function registerPlugins(app) {
  // Register all plugins
  aiPlugin.registerPlugin(app);
  matchmakingPlugin.registerPlugin(app);
}

module.exports = { registerPlugins };