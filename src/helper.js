import webpack from 'webpack';
import getBaseOpts from './getBaseOpts';
import getLoaderOpts from './getLoaderOpts';
import getPluginOpts from './getPluginOpts';
import Configuration from './configFactory/index';

const configManager = new Configuration();

export { webpack as default, getBaseOpts, getLoaderOpts, getPluginOpts, configManager };
