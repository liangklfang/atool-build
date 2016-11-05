import I18nPlugin from 'i18n-webpack-plugin';
import webpack, { getBaseOpts, configManager } from '../../../src/helper';

const baseOpts = getBaseOpts();
const langs = {
  "en": null,
  "de": require("./de.json")
};

module.exports = function() {
  return Object.keys(langs).map((lang) => {
    return () => {
      const obj = configManager.init({
        baseOpts: {
          ...baseOpts,
          output: {
            ...baseOpts.output,
            filename: `app.${lang}.js`,
          },
        },
      });
      obj.base().set('name', lang);
      obj.plugins().set('i18nPlugin', new I18nPlugin(
        langs[lang]
      ));

      return obj;
    }
  });
};
