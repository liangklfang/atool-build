import { getPluginOpts, configManager } from '../../../src/helper';

module.exports = function() {
  let modifyPluginOpts = getPluginOpts();
  modifyPluginOpts.definePluginOpts['process.env.NODE_ENV'] = JSON.stringify('development');

  return () => {
    return configManager.init({
      pluginOpts: modifyPluginOpts,
    });
  };
}