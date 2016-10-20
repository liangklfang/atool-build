import webpack from 'webpack';
import loaderOpts from './loaders';
import pluginOpts from './plugins';
import Configuration from './configFactory/index';

const opts = {};
const configManager = new Configuration(opts);

export { webpack as default, loaderOpts, pluginOpts, configManager };
