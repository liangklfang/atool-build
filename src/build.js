import webpack, { ProgressPlugin } from 'webpack';
import chalk from 'chalk';
import existsSync from 'fs-exists-sync';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import MapJsonPlugin from 'map-json-webpack-plugin';

import { resolve, join } from 'path';

import loaderOpts from './loaders';
import pluginOpts from './plugins';
import { configManager } from './helper';

function mergeCfgFromBin(args, cfgManager, configInitializedObj) {
  const pkgPath = join(args.cwd, 'package.json');
  const pkg = existsSync(pkgPath) ? require(pkgPath) : {};// eslint-disable-line

  const emptyBuildins = [
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'fs',
    'module',
    'net',
    'readline',
    'repl',
    'tls',
  ];

  const browser = pkg.browser || {};

  const node = emptyBuildins.reduce((obj, name) => {
    if (!(name in browser)) {
      return { ...obj, ...{ [name]: 'empty' } };
    }
    return obj;
  }, {});

  configInitializedObj.base().modify('node', node);

  let theme;
  if (pkg.theme && typeof pkg.theme === 'string') {
    let cfgPath = pkg.theme;
    // relative path
    if (cfgPath.charAt(0) === '.') {
      cfgPath = resolve(args.cwd, cfgPath);
    }
    const getThemeConfig = require(cfgPath);// eslint-disable-line
    theme = getThemeConfig();
  } else if (pkg.theme && typeof pkg.theme === 'object') {
    theme = pkg.theme;
  }

  if (theme) {
    cfgManager.loadersOpts.lessLoaderQuery.modifyVars = theme;
    const lessLoaderOpt = configInitializedObj.loaders().get('lessLoader');
    lessLoaderOpt.loader.loader.pop().push({
      loader: 'less-loader',
      query: cfgManager.loadersOpts.lessLoaderQuery,
    });
    configInitializedObj.loaders()
      .set('lessLoader', lessLoaderOpt);

    const lessLoaderWithModule = configInitializedObj.loaders().get('lessLoaderWithModule');
    lessLoaderWithModule.loader.loader.pop().push({
      loader: 'less-loader',
      query: cfgManager.loadersOpts.lessLoaderQuery,
    });
    configInitializedObj.loaders()
      .set('lessLoaderWithModule', lessLoaderWithModule);
  }

  if (pkg.entry) {
    configInitializedObj.base().modify('entry', pkg.entry);
  }

  if (args.outputPath) {
    const output = configInitializedObj.base().get('output');
    output.path = args.outputPath;
    configInitializedObj.base().modify('output', output);
  }

  if (args.hash) {
    configInitializedObj.plugins()
      .remove('extractTextPlugin')
      .set('extractTextPlugin', new ExtractTextPlugin({
        filename: '[name]-[chunkhash].css',
        disable: false,
        allChunks: true,
      }))
      .set('mapJsonPlugin', new MapJsonPlugin({
        assetsPath: pkg.name,
      }));

    const output = configInitializedObj.base().get('output');
    configInitializedObj.base().modify('output', {
      ...output,
      ...{
        filename: '[name]-[chunkhash].js',
        chunkFilename: '[name]-[chunkhash].js',
      },
    });
  }

  if (args.publicPath) {
    const output = configInitializedObj.base().get('output');
    configInitializedObj.base().modify('output', {
      ...output,
      ...{
        publicPath: args.publicPath,
      },
    });
  }

  if (args.devtool) {
    configInitializedObj.base().modify('devtool', args.devtool);
  }

  if (!args.compress) {
    cfgManager.pluginOpts.loaderOptionsPluginOpts.minimize = false;

    configInitializedObj.plugins()
      .remove('loaderOptionsPlugin')
      .set('loaderOptionsPlugin', new webpack.LoaderOptionsPlugin(cfgManager.pluginOpts.loaderOptionsPluginOpts))
      .remove('uglifyJsPlugin');
  }

  if (args.verbose) {
    configInitializedObj.base().set('profile', true);
  }

  if (args.json) {
    const roPath = resolve(args.cwd, 'build/records.json');
    configInitializedObj.base()
      .set('recordsOutputPath', roPath);
    console.log('\n  webpack: the records json file will output at ->');
    console.log(`  ${chalk.green(roPath)} \n`);
  }

  if (args.watch) {
    configInitializedObj.plugins()
      .set('progressPlugin', new ProgressPlugin((percentage, msg) => {
        const stream = process.stderr;
        if (stream.isTTY && percentage < 0.71) {
          stream.cursorTo(0);
          stream.write(`📦  ${chalk.magenta(msg)}`);
          stream.clearLine(1);
        } else if (percentage === 1) {
          console.log(chalk.green('\nwebpack: bundle build is now finished.'));
        }
      }));
  }
}

export default function build(args, callback) {
  let configInitializedObj;
  // check configManager is had initialized
  if (configManager.isInitialized) {
    const customConfigPath = resolve(args.cwd, args.config || 'webpack.config.js');
    if (!existsSync(customConfigPath)) {
      // error
    }

    configInitializedObj = require(customConfigPath);// eslint-disable-line
  } else {
    configInitializedObj = configManager.init({
      loaderOpts,
      pluginOpts,
    });
  }
  mergeCfgFromBin(args, configManager, configInitializedObj);

  const webpackConfig = configInitializedObj.resolveAll();

  function doneHandler(err, stats) {
    const { errors } = stats.toJson();
    if (errors && errors.length) {
      process.on('exit', () => {
        process.exit(1);
      });
    }
    // if watch enabled only stats.hasErrors would log info
    // otherwise  would always log info
    if (!args.watch || stats.hasErrors()) {
      const buildInfo = stats.toString({
        colors: true,
        children: !!args.verbose,
        chunks: !!args.verbose,
        modules: !!args.verbose,
        chunkModules: !!args.verbose,
        hash: !!args.verbose,
        version: !!args.verbose,
        name: 'extract-text-webpack-plugin',
      });
      if (stats.hasErrors()) {
        console.error(buildInfo);
      } else {
        console.log(buildInfo);
      }
    }

    if (err) {
      process.on('exit', () => {
        process.exit(1);
      });
      console.error(err);
    }

    if (callback) {
      callback(err);
    }
  }

  // Run compiler.
  const compiler = webpack(webpackConfig);

  if (args.watch) {
    compiler.watch(args.watch || 200, doneHandler);
  } else {
    compiler.run(doneHandler);
  }
}
