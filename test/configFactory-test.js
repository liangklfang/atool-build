import { join } from 'path';
import expect from 'expect';
import webpack from 'webpack';

import Configuration from '../src/configFactory/index';
import getBaseOpts from '../src/getBaseOpts';
import getLoaderOpts from '../src/getLoaderOpts';
import getPluginOpts from '../src/getPluginOpts';

require('mocha-sinon');

let config;

describe('configFactory', () => {
  before(done => {
    config = new Configuration();
    config.init();
    done();
  });

  it('should be a singleton', () => {
    const config2 = new Configuration();
    const isSingleton = config === config2;

    expect(isSingleton).toBe(true);
  });

  it('should Configuration.defaults  be equal to getBaseOpts getLoaderOpts getPluginOpts', () => {
    config.init();

    expect(Configuration.defaults.baseOpts).toEqual(getBaseOpts());
    expect(Configuration.defaults.loaderOpts).toEqual(getLoaderOpts());
    expect(Configuration.defaults.pluginOpts).toEqual(getPluginOpts());
  });

  it('should return four functions [base] [loaders] [plugins] and [resolveAll] after instance.init()', () => {
    const obj = config.init();

    expect(obj.base).toBeA('function');
    expect(obj.loaders).toBeA('function');
    expect(obj.plugins).toBeA('function');
    expect(obj.resolveAll).toBeA('function');
  });

  it('should return four functions [set] [get] [modify] [remove] after instance.init().base()', () => {
    const obj = config.init();
    const base = obj.base();

    expect(base.set).toBeA('function');
    expect(base.get).toBeA('function');
    expect(base.modify).toBeA('function');
    expect(base.remove).toBeA('function');
  });

  it('init with custom config', () => {
    const obj = config.init({
      baseOpts: {
        ...getBaseOpts(),
        output: {
          path: './www',
        },
      }
    });
    const path = obj.base().get('output').path;

    expect(path).toEqual('./www');
  });

  it('base.set', function() {
    this.sinon.stub(console, 'warn');
    const obj = config.init();  
    obj.base().set('node', 1);
    expect(console.warn.calledOnce).toBe(true);
    obj.base().set('x', 1);
    expect(obj.base().get('x')).toEqual(1);
  });

  it('base.modify', function() {
    this.sinon.stub(console, 'warn');
    const obj = config.init();  
    obj.base().modify('x', 1);
    expect(console.warn.calledOnce).toBe(true);
    obj.base().modify('node', 1);
    expect(obj.base().get('node')).toEqual(1);
  });

  it('base.remove', function() {
    this.sinon.stub(console, 'warn');
    const obj = config.init();  
    obj.base().remove('x', 1);
    expect(console.warn.calledOnce).toBe(true);
    obj.base().remove('node');
    expect(obj.base().get('node')).toEqual(undefined);
  });

  it('should return four functions [set] [get] [modify] [remove] after instance.init().loaders()', () => {
    const obj = config.init();
    const loaders = obj.loaders();

    expect(loaders.set).toBeA('function');
    expect(loaders.get).toBeA('function');
    expect(loaders.modify).toBeA('function');
    expect(loaders.remove).toBeA('function');
  });

  it('loaders.get', function() {
    const obj = config.init();  

    expect(obj.loaders().get('htmlLoader')).toEqual({
      test: /\.html?$/,
      loader: 'file-loader',
      query: {
        name: '[name].[ext]',
      },
    });
  });

  it('loaders.set', function() {
    this.sinon.stub(console, 'warn');
    const obj = config.init();  
    obj.loaders().set('htmlLoader', 1);
    expect(console.warn.calledOnce).toBe(true);
    obj.loaders().set('x', 1);
    expect(obj.loaders().get('x')).toEqual(1);
  });

  it('loaders.modify', function() {
    this.sinon.stub(console, 'warn');
    const obj = config.init();  
    obj.loaders().modify('x', 1);
    expect(console.warn.calledOnce).toBe(true);
    obj.loaders().modify('htmlLoader', 1);
    expect(obj.loaders().get('htmlLoader')).toEqual(1);
  });

  it('loaders.remove', function() {
    this.sinon.stub(console, 'warn');
    const obj = config.init();  
    obj.loaders().remove('x', 1);
    expect(console.warn.calledOnce).toBe(true);
    obj.loaders().remove('htmlLoader');
    expect(obj.loaders().get('htmlLoader')).toEqual(undefined);
  });

  it('should return four functions [set] [get] [modify] [remove] after instance.init().plugins()', () => {
    const obj = config.init();
    const plugins = obj.plugins();

    expect(plugins.set).toBeA('function');
    expect(plugins.get).toBeA('function');
    expect(plugins.modify).toBeA('function');
    expect(plugins.remove).toBeA('function');
  });

  it('plugins.get', function() {
    const obj = config.init();  

    expect(obj.plugins().get('dedupePlugin')).toBeA(webpack.optimize.DedupePlugin);
  });

  it('plugins.set', function() {
    this.sinon.stub(console, 'warn');
    const obj = config.init();  
    obj.plugins().set('dedupePlugin', 1);
    expect(console.warn.calledOnce).toBe(true);
    obj.plugins().set('x', 1);
    expect(obj.plugins().get('x')).toEqual(1);
  });

  it('plugins.modify', function() {
    this.sinon.stub(console, 'warn');
    const obj = config.init();  
    obj.plugins().modify('x', 1);
    expect(console.warn.calledOnce).toBe(true);
    obj.plugins().modify('dedupePlugin', 1);
    expect(obj.plugins().get('dedupePlugin')).toEqual(1);
  });

  it('plugins.remove', function() {
    this.sinon.stub(console, 'warn');
    const obj = config.init();  
    obj.plugins().remove('x', 1);
    expect(console.warn.calledOnce).toBe(true);
    obj.plugins().remove('dedupePlugin');
    expect(obj.plugins().get('dedupePlugin')).toEqual(undefined);
  });

  it('resolveAll', function() {
    const obj = config.init();
    expect(obj.resolveAll().output.path).toEqual('');
  });

});
