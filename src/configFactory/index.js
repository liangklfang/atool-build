import chalk from 'chalk';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import clone from 'lodash.clonedeep'
import setCfg from '../config';
import getBaseOpts from '../getBaseOpts';
import getLoaderOpts from '../getLoaderOpts';
import getPluginOpts from '../getPluginOpts';

const _base = new WeakMap();
const _loaders = new WeakMap();
const _plugins = new WeakMap();

function initialized(context) {
  const self = context;

  return {
    base() {
      let baseCfg = _base.get(self);

      return {
        get(key) {
          return _base.get(self)[key];
        },
        set(key, value) {
          if (Object.keys(baseCfg).indexOf(key) >= 0) {
            console.warn(chalk.yellow(`warn: ${key} is existed, if you want to override use 'modify()' instead\n`));

            return this;
          }
          baseCfg = { ...baseCfg, ...{ [key]: value } };
          _base.set(self, baseCfg);

          return this;
        },
        modify(key, value) {
          if (Object.keys(baseCfg).indexOf(key) < 0) {
            console.warn(chalk.yellow(`warn: ${key} is not existed, if you want to add use 'set()' instead\n`));

            return this;
          }
          baseCfg[key] = value;
          _base.set(self, baseCfg);

          return this;
        },
        remove(key) {
          if (Object.keys(baseCfg).indexOf(key) < 0) {
            console.warn(chalk.yellow(`warn: ${key} is not existed\n`));

            return this;
          }
          delete baseCfg[key];
          _base.set(self, baseCfg);

          return this;
        },
      };
    },

    plugins() {
      let pluginsCfg = _plugins.get(self);

      return {
        get(key) {
          return _plugins.get(self)[key];
        },
        set(key, value) {
          if (Object.keys(pluginsCfg).indexOf(key) >= 0) {
            console.warn(chalk.yellow(`warn: ${key} is existed, if you want to override use 'modify()' instead\n`));

            return this;
          }
          pluginsCfg = { ...pluginsCfg, ...{ [key]: value } };
          _plugins.set(self, pluginsCfg);

          return this;
        },
        modify(key, value) {
          if (Object.keys(pluginsCfg).indexOf(key) < 0) {
            console.warn(chalk.yellow(`warn: ${key} is not existed, if you want to add use 'set()' instead\n`));

            return this;
          }
          pluginsCfg[key] = value;
          _plugins.set(self, pluginsCfg);

          return this;
        },
        remove(key) {
          if (Object.keys(pluginsCfg).indexOf(key) < 0) {
            console.warn(chalk.yellow(`warn: ${key} is not existed\n`));

            return this;
          }
          delete pluginsCfg[key];
          _plugins.set(self, pluginsCfg);

          return this;
        },
      };
    },

    loaders() {
      let loadersCfg = _loaders.get(self);

      return {
        get(key) {
          return _loaders.get(self)[key];
        },
        set(key, value) {
          if (Object.keys(loadersCfg).indexOf(key) >= 0) {
            console.warn(chalk.yellow(`warn: ${key} is existed, if you want to override use 'modify()' instead\n`));

            return this;
          }
          loadersCfg = { ...loadersCfg, ...{ [key]: value } };
          _loaders.set(self, loadersCfg);

          return this;
        },
        modify(key, value) {
          if (Object.keys(loadersCfg).indexOf(key) < 0) {
            console.warn(chalk.yellow(`warn: ${key} is not existed, if you want to add use 'set()' instead\n`));

            return this;
          }
          loadersCfg[key] = value;
          _loaders.set(self, loadersCfg);

          return this;
        },
        remove(key) {
          if (Object.keys(loadersCfg).indexOf(key) < 0) {
            console.warn(chalk.yellow(`warn: ${key} is not existed\n`));

            return this;
          }
          delete loadersCfg[key];
          _loaders.set(self, loadersCfg);

          return this;
        },
      };
    },

    resolveAll() {
      const base = _base.get(self);
      const plugins = _plugins.get(self);
      const loaders = _loaders.get(self);
      const rules = Object.keys(loaders).reduce((prev, loader) => {
        if (loaders[loader].extract) {
          delete loaders[loader].extract;
          const loaderOption = loaders[loader].loader;
          loaders[loader].loader = ExtractTextPlugin.extract(loaderOption);
        }
        prev.push(loaders[loader]);

        return prev;
      }, []);
      const pluginList = Object.keys(plugins).reduce((prev, plugin) => {
        prev.push(plugins[plugin]);

        return prev;
      }, []);

      const webpackConfig = {
        ...base,
        ...{
          module: {
            loaders: rules,
          },
        },
        ...{
          plugins: pluginList,
        },
      };

      return webpackConfig;
    },
  };
}

export default class Configuration {
  static defaults = {
    baseOpts: getBaseOpts(),
    loaderOpts: getLoaderOpts(),
    pluginOpts: getPluginOpts(),
  };

  constructor() {
    if (typeof Configuration.instance === 'object') {
      return Configuration.instance;
    }
    this.isInitialized = false;
    _base.set(this, {});
    _loaders.set(this, {});
    _plugins.set(this, {});

    Configuration.instance = this;

    return this;
  }

  init(customOpts = {}) {
    const self = this;
    if (self.isInitialized) {
      Configuration.defaults.baseOpts = getBaseOpts(); // eslint-disable-line
      Configuration.defaults.loaderOpts = getLoaderOpts(); // eslint-disable-line
      Configuration.defaults.pluginOpts = getPluginOpts(); // eslint-disable-line

      _base.set(self, {});
      _loaders.set(self, {});
      _plugins.set(self, {});
    }
    Configuration.defaults = {
      ...Configuration.defaults,
      ...customOpts,
    };
    self.isInitialized = true;
    const initObj = initialized(self);
    setCfg(clone(Configuration.defaults), initObj);

    return initObj;
  }
}
