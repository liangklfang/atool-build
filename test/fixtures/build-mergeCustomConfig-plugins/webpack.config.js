import webpack, { configManager } from '../../../src/helper';

export default function customCfg() {
  return () => { 
    const obj = configManager.init();
    obj.plugins().set('bannerPlugin', new webpack.BannerPlugin({
      banner: 'atool-build',
      entryOnly: true,
    }));

    return obj;
  };
}