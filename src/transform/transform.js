import existsSync from 'fs-exists-sync';
import vfs from 'vinyl-fs';
import NpmImportPlugin from 'less-plugin-npm-import';
import babel from 'gulp-babel';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import filter from 'gulp-filter';
import rename from 'gulp-rename';
import chalk from 'chalk';
// import map from 'gulp-map';

import { resolve, sep } from 'path';

import { configManager } from '../helper';
import Configuration from '../configFactory/index';

const getFinalRules = ({ include = [], exclude = [] } = {}) => {
  let afterExclude = exclude;
  if (exclude.length) {
    afterExclude = exclude.map(i => `!${i}`);
  }

  return include.concat(afterExclude);
};

export default function transform(args) {
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

  const rules = getFinalRules({
    include: args.include,
    exclude: args.exclude,
  });

  // var log = function(file, cb) {
  //   console.log(file.path, 'file through');
  //   cb(null, file);
  // };

  cfgIniObjBlocks.map(async (block) => {
    await (() => {
      block();
      const jsFilter = filter(['**/*.js', '**/*.jsx'], { restore: true });
      const lessFilter = filter('**/*.less', { restore: true });

      const babelOpts = Configuration.defaults.loaderOpts.babelLoaderQuery;
      delete babelOpts.cacheDirectory;
      vfs.src(rules, { base: args.cwd })
        .pipe(jsFilter)
        .pipe(babel(Configuration.defaults.loaderOpts.babelLoaderQuery))
        .pipe(jsFilter.restore)
        .pipe(lessFilter)
        .pipe(less({ plugins: [new NpmImportPlugin({ prefix: '~' })] }))
        .pipe(postcss(Configuration.defaults.pluginOpts.loaderOptionsPluginOpts.options.postcss))
        .pipe(lessFilter.restore)
        .pipe(rename((path) => {
          // todo enhance
          const pathArray = path.dirname.split(sep);
          if (pathArray.length) {
            pathArray.splice(0, 1);
          }

          path.dirname = pathArray.join(sep);
        }))
        .pipe(vfs.dest(resolve(args.cwd, args.outputDir)))
        .on('error', (err) => {
          throw new Error(`compile failed ${err}`);
        })
        .on('end', () => {
          console.log(chalk.green('compile success'));
        });
    })();
  });
}
