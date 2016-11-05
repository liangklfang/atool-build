import { resolve } from 'path';

export default function getBaseOpts() {
  return {
    output: {
      path: '',
      filename: '[name].js',
      chunkFilename: '[name].js',
    },
    devtool: '',
    resolve: {
      modules: [resolve(__dirname, '../node_modules'), 'node_modules'],
      extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    resolveLoader: {
      modules: [resolve(__dirname, '../node_modules'), 'node_modules'],
    },
    entry: {},
    node: {},
  };
}
