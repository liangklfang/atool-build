import { join, resolve } from 'path';

import webpack from 'webpack';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default function setCfg(configManager, configInitializedObj) {
  const pluginOpts = configManager.pluginOpts;
  const loaderOpts = configManager.loaderOpts;

  // set base config
  configInitializedObj.base()
    .set('output', {
      path: join(process.cwd(), './dist/'),
      filename: '[name].js',
      chunkFilename: '[name].js',
    })
    .set('devtool', '')
    .set('resolve', {
      modules: [resolve(__dirname, '../node_modules'), 'node_modules'],
      extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.ts', '.tsx', '.js', '.jsx', '.json'],
    })
    .set('resolveLoader', {
      modules: [resolve(__dirname, '../node_modules'), 'node_modules'],
    })
    .set('entry', {})
    .set('node', {});

  // set loaders config
  configInitializedObj.loaders()
    .set('jsLoader', {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: loaderOpts.babelLoaderQuery,
    })
    .set('jsxLoader', {
      test: /\.jsx$/,
      loader: 'babel-loader',
      query: loaderOpts.babelLoaderQuery,
    })
    .set('tsxLoader', {
      test: /\.tsx?$/,
      loaders: ['babel-loader', 'ts-loader'],
    })
    .set('cssLoader', {
      test(filePath) {
        return /\.css$/.test(filePath) && !/\.module\.css$/.test(filePath);
      },
      loader: {
        loader: [
          {
            loader: 'css-loader',
            query: loaderOpts.cssLoaderQuery,
          },
          'postcss-loader',
        ],
      },
      extract: true,
    })
    .set('lessLoader', {
      test(filePath) {
        return /\.less$/.test(filePath) && !/\.module\.less$/.test(filePath);
      },
      loader: {
        loader: [
          {
            loader: 'css-loader',
            query: loaderOpts.cssLoaderQuery,
          },
          'postcss-loader',
          {
            loader: 'less-loader',
            query: loaderOpts.lessLoaderQuery,
          },
        ],
      },
      extract: true,
    })
    .set('cssLoaderWithModule', {
      test: /\.module\.css$/,
      loader: {
        loader: [
          {
            loader: 'css-loader',
            query: loaderOpts.cssLoaderEnableModuleQuery,
          },
          'postcss-loader',
        ],
      },
      extract: true,
    })
    .set('lessLoaderWithModule', {
      test: /\.module\.less$/,
      loader: {
        loader: [
          {
            loader: 'css-loader',
            query: loaderOpts.cssLoaderEnableModuleQuery,
          },
          'postcss-loader',
          {
            loader: 'less-loader',
            query: loaderOpts.lessLoaderQuery,
          },
        ],
      },
      extract: true,
    })
    .set('woffLoader', {
      test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url-loader',
      query: {
        ...loaderOpts.urlLoaderLimitQuery,
        ...{
          minetype: 'application/font-woff',
        },
      },
    })
    .set('woff2Loader', {
      test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url-loader',
      query: {
        ...loaderOpts.urlLoaderLimitQuery,
        ...{
          minetype: 'application/font-woff',
        },
      },
    })
    .set('ttfLoader', {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url-loader',
      query: {
        ...loaderOpts.urlLoaderLimitQuery,
        ...{
          minetype: 'application/octet-stream',
        },
      },
    })
    .set('eotLoader', {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'file-loader',
    })
    .set('svgLoader', {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url-loader',
      query: {
        ...loaderOpts.urlLoaderLimitQuery,
        ...{
          minetype: 'image/svg+xml',
        },
      },
    })
    .set('imagesLoader', {
      test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
      loader: 'url-loader',
      query: loaderOpts.urlLoaderLimitQuery,
    })
    .set('jsonLoader', {
      test: /\.json$/,
      loader: 'json-loader',
    })
    .set('html', {
      test: /\.html?$/,
      loader: 'file-loader',
      query: loaderOpts.fileLoaderHtmlQuery,
    });

  // set plugins config
  configInitializedObj.plugins()
    .set('dedupePlugin', new webpack.optimize.DedupePlugin())
    .set('definePlugin', new webpack.DefinePlugin(pluginOpts.definePluginOpts))
    .set('uglifyJsPlugin', new webpack.optimize.UglifyJsPlugin(pluginOpts.uglifyJsPluginOpts))
    .set('loaderOptionsPlugin', new webpack.LoaderOptionsPlugin(pluginOpts.loaderOptionsPluginOpts))
    .set('noErrorsPlugin', new webpack.NoErrorsPlugin())
    .set('caseSensitivePathsPlugin', new CaseSensitivePathsPlugin())
    .set('extractTextPlugin', new ExtractTextPlugin(pluginOpts.extractTextPluginOpts));
}
