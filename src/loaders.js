import findCacheDir from 'find-cache-dir';

module.exports = {
  babelLoaderQuery: {
    cacheDirectory: findCacheDir({
      name: 'atool-build',
    }),
    presets: [
      require.resolve('babel-preset-es2015'),
      require.resolve('babel-preset-react'),
      require.resolve('babel-preset-stage-0'),
    ],
    plugins: [
      require.resolve('babel-plugin-transform-runtime'),
      require.resolve('babel-plugin-add-module-exports'),
      require.resolve('babel-plugin-transform-decorators-legacy'),
    ],
  },

  tsLoaderQuery: {
    target: 'es6',
    jsx: 'preserve',
    moduleResolution: 'node',
    declaration: false,
    sourceMap: true,
  },

  cssLoaderQuery: {
    autoprefixer: false,
    sourceMap: true,
  },

  cssLoaderEnableModuleQuery: {
    autoprefixer: false,
    sourceMap: true,
    modules: true,
    localIdentName: '[local]___[hash:base64:5]',
  },

  lessLoaderQuery: {
    sourceMap: true,
    modifyVars: {},
  },

  urlLoaderLimitQuery: {
    limit: 10000,
  },

  fileLoaderHtmlQuery: {
    name: '[name].[ext]',
  },
};
