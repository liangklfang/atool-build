import { join } from 'path';
import pkg from './package.json';
import { getBaseOpts, configManager } from '../../../src/helper';

module.exports = function() {
  const modifyBaseOpts = getBaseOpts();
  modifyBaseOpts.output.path = join(process.cwd(), 'dist', pkg.name, pkg.version);

  return () => {
    return configManager.init({
      baseOpts: modifyBaseOpts,
    });
  }
}
