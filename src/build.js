import webpack, { ProgressPlugin } from 'webpack';
import chalk from 'chalk';
import existsSync from 'fs-exists-sync';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import MapJsonPlugin from 'map-json-webpack-plugin';
import { resolve, join } from 'path';

import Configuration from './configFactory/index';
import { configManager } from './helper';

function mergeWebpackCfg(args, cfgObjBlock) {
  const configInitializedObj = cfgObjBlock();
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

  Configuration.defaults.baseOpts.node = node;
  configInitializedObj.base().modify('node', Configuration.defaults.baseOpts.node);

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
    Configuration.defaults.loaderOpts.lessLoaderQuery.modifyVars = theme;
    const lessLoaderOpt = configInitializedObj.loaders().get('lessLoader');
    const lessLoaderArray = lessLoaderOpt.loader.loader;
    lessLoaderArray.pop();
    lessLoaderArray.push({
      loader: 'less-loader',
      query: Configuration.defaults.loaderOpts.lessLoaderQuery,
    });
    lessLoaderOpt.loader.loader = lessLoaderArray;
    configInitializedObj.loaders()
      .modify('lessLoader', lessLoaderOpt);

    const lessLoaderWithModule = configInitializedObj.loaders().get('lessLoaderWithModule');
    const lessLoaderWithModuleArray = lessLoaderWithModule.loader.loader;
    lessLoaderWithModuleArray.pop();
    lessLoaderWithModuleArray.push({
      loader: 'less-loader',
      query: Configuration.defaults.loaderOpts.lessLoaderQuery,
    });
    lessLoaderWithModule.loader.loader = lessLoaderWithModuleArray;
    configInitializedObj.loaders()
      .modify('lessLoaderWithModule', lessLoaderWithModule);
  }

  if (pkg.entry) {
    Configuration.defaults.baseOpts.entry = pkg.entry;
    configInitializedObj.base().modify('entry', Configuration.defaults.baseOpts.entry);
  }

  if (args.outputPath) {
    Configuration.defaults.baseOpts.output.path = args.outputPath;
    configInitializedObj.base().modify('output', Configuration.defaults.baseOpts.output);
  } else {
    const opath = Configuration.defaults.baseOpts.output.path;
    if (!opath) {
      Configuration.defaults.baseOpts.output.path = join(args.cwd, './dist');
      configInitializedObj.base().modify('output', Configuration.defaults.baseOpts.output);
    }
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

    const moutput = {
      ...Configuration.defaults.baseOpts.output,
      ...{
        filename: '[name]-[chunkhash].js',
        chunkFilename: '[name]-[chunkhash].js',
      },
    };
    Configuration.defaults.baseOpts.output = moutput;
    configInitializedObj.base().modify('output', moutput);
  }

  if (args.publicPath) {
    const moutput = {
      ...Configuration.defaults.baseOpts.output,
      ...{
        publicPath: args.publicPath,
      },
    };
    Configuration.defaults.baseOpts.output = moutput;
    configInitializedObj.base().modify('output', moutput);
  }

  if (args.devtool) {
    Configuration.defaults.baseOpts.devtool = args.devtool;
    configInitializedObj.base().modify('devtool', Configuration.defaults.baseOpts.devtool);
  }

  if (!args.compress) {
    Configuration.defaults.pluginOpts.loaderOptionsPluginOpts.minimize = false;

    configInitializedObj.plugins()
      .remove('loaderOptionsPlugin')
      .set(
        'loaderOptionsPlugin',
        new webpack.LoaderOptionsPlugin(Configuration.defaults.pluginOpts.loaderOptionsPluginOpts)
      )
      .remove('uglifyJsPlugin');
  }

  if (args.verbose) {
    Configuration.defaults.baseOpts.profile = true;
    configInitializedObj.base().set('profile', true);
  }

  if (args.json) {
    const roPath = join(args.cwd, args.json, 'records.json');
    Configuration.defaults.baseOpts.recordsOutputPath = roPath;
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
      }))
      .remove('dedupePlugin');
  }

  return configInitializedObj.resolveAll();
}

export default function build(args, callback) {
  let cfgIniObjBlocks;
  const customConfigPath = resolve(args.cwd, args.config || 'webpack.config.js');

  if (existsSync(customConfigPath)) {
    cfgIniObjBlocks = require(customConfigPath)(); // eslint-disable-line
    cfgIniObjBlocks = Array.isArray(cfgIniObjBlocks) ? cfgIniObjBlocks : [cfgIniObjBlocks];
  } else {
    cfgIniObjBlocks = [
      () => configManager.init(),
    ];
  }

  function getFinalWebpackCfg(p, blocks) {
    return blocks.map(block => mergeWebpackCfg(p, block));
  }

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

  const webpackConfig = getFinalWebpackCfg(args, cfgIniObjBlocks);
  // Run compiler.
  const compiler = webpack(webpackConfig);

  if (args.watch) {
    compiler.watch(args.watch || 200, doneHandler);
  } else {
    compiler.run(doneHandler);
  }
}
