import chalk from 'chalk';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import setCfg from '../config';

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
            console.log(`  ${chalk.yellow(key)} is existed, if you want to override use 'modify()' instead\n`);

            return this;
          }
          baseCfg = { ...baseCfg, ...{ [key]: value } };
          _base.set(self, baseCfg);

          return this;
        },
        modify(key, value) {
          if (Object.keys(baseCfg).indexOf(key) < 0) {
            console.log(`  ${chalk.yellow(key)} is not existed, if you want to add use 'set()' instead\n`);

            return this;
          }
          baseCfg[key] = value;
          _base.set(self, baseCfg);

          return this;
        },
        remove(key) {
          if (Object.keys(baseCfg).indexOf(key) < 0) {
            console.log(`  ${chalk.yellow(key)} is not existed\n`);

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
            console.log(`  ${chalk.yellow(key)} is existed, if you want to override use 'modify()' instead\n`);

            return this;
          }
          pluginsCfg = { ...pluginsCfg, ...{ [key]: value } };
          _plugins.set(self, pluginsCfg);

          return this;
        },
        modify(key, value) {
          if (Object.keys(pluginsCfg).indexOf(key) < 0) {
            console.log(`  ${chalk.yellow(key)} is not existed, if you want to add use 'set()' instead\n`);

            return this;
          }
          pluginsCfg[key] = value;
          _plugins.set(self, pluginsCfg);

          return this;
        },
        remove(key) {
          if (Object.keys(pluginsCfg).indexOf(key) < 0) {
            console.log(`  ${chalk.yellow(key)} is not existed\n`);

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
            console.log(`  ${chalk.yellow(key)} is existed, if you want to override use 'modify()' instead\n`);

            return this;
          }
          loadersCfg = { ...loadersCfg, ...{ [key]: value } };
          _loaders.set(self, loadersCfg);

          return this;
        },
        modify(key, value) {
          if (Object.keys(loadersCfg).indexOf(key) < 0) {
            console.log(`  ${chalk.yellow(key)} is not existed, if you want to add use 'set()' instead\n`);

            return this;
          }
          loadersCfg[key] = value;
          _loaders.set(self, loadersCfg);

          return this;
        },
        remove(key) {
          if (Object.keys(loadersCfg).indexOf(key) < 0) {
            console.log(`  ${chalk.yellow(key)} is not existed\n`);

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

      return {
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
    },
  };
}

export default class Configuration {
  static defaults = {
    pluginOpts: {},
    loaderOpts: {},
  };

  constructor(buildInOpts) {
    Configuration.defaults = { ...Configuration.defaults, ...buildInOpts };
    this.isInitialized = false;
    this.pluginOpts = Configuration.defaults.pluginOpts;
    this.loaderOpts = Configuration.defaults.loaderOpts;
    _base.set(this, {});
    _loaders.set(this, {});
    _plugins.set(this, {});
  }

  init(customOpts) {
    const self = this;
    if (self.isInitialized) {
      console.log(chalk.red('Had been initialized'));

      return false;
    }
    const options = { ...Configuration.defaults, ...customOpts };
    self.isInitialized = true;
    self.pluginOpts = options.pluginOpts;
    self.loaderOpts = options.loaderOpts;

    const initObj = initialized(self);
    setCfg(self, initObj);

    return initObj;
  }
}
