import rucksack from 'rucksack-css';
import autoprefixer from 'autoprefixer';

const postcssPluginList = [
  rucksack(),
  autoprefixer({
    browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
  }),
];

export default function getPluginOpts() {
  return {
    definePluginOpts: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },

    uglifyJsPluginOpts: {
      sourceMap: true,
      output: {
        ascii_only: true,
      },
      compress: {
        warnings: false,
      },
    },

    loaderOptionsPluginOpts: {
      minimize: true,
      debug: true,
      options: {
        context: __dirname,
        postcss: postcssPluginList,
        resolve: {}, //https://github.com/TypeStrong/ts-loader/issues/283
      },
    },

    extractTextPluginOpts: {
      filename: '[name].css',
      disable: false,
      allChunks: true,
    },
  };
}
