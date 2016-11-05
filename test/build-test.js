import { join } from 'path';
import { readFileSync } from 'fs';
import glob from 'glob';
import build from '../src/build';
import expect from 'expect';

function assert(actualDir, _expect) {
  const expectDir = join(__dirname, 'expect', _expect);
  const actualFiles = glob.sync('**/*', { cwd: actualDir, nodir: true });

  actualFiles.forEach(file => {
    const actualFile = readFileSync(join(actualDir, file), 'utf-8');
    const expectFile = readFileSync(join(expectDir, file), 'utf-8');
    expect(actualFile).toEqual(expectFile);
  });
}

function testBuild(args, fixture) {
  return new Promise(resolve => {
    const cwd = join(__dirname, 'fixtures', fixture);
    const dist = args.outputPath || 'dist';
    const outputPath = join(cwd, dist);
    process.chdir(cwd);

    const defaultConfig = {
      cwd,
      compress: false,
    };

    build({...defaultConfig, ...args}, err => {
      if (err) throw new Error(err);
      assert(outputPath, fixture);
      resolve();
    });
  });
}

describe('lib/build', function () {
  it('should build normally', () => {
    return testBuild({hash:true}, 'build-normal');
  });
  it('should support class property', () => {
    return testBuild({}, 'build-class-property');
  });
  it('should support less', () => {
    return testBuild({}, 'build-less');
  });
  it('should support css modules', () => {
    return testBuild({}, 'build-css-modules');
  });
  it('should support add-module-exports', () => {
    return testBuild({}, 'build-add-module-exports');
  });
  it('should support jsx', () => {
    return testBuild({}, 'build-jsx');
  });
  it('should support json', () => {
    return testBuild({}, 'build-json');
  });
  it('should support node builtins', () => {
    return testBuild({}, 'build-node-builtins');
  });
  it('should support mergeCustomConfig plugins', () => {
    return testBuild({}, 'build-mergeCustomConfig-plugins');
  });
  it('should support mergeCustomConfig environment production', () => {
    return testBuild({compress:true}, 'build-mergeCustomConfig-environment-production');
  });
  it('should support mergeCustomConfig environment development', () => {
    return testBuild({}, 'build-mergeCustomConfig-environment-development');
  });
  it('should support config', () => {
    return testBuild({config:'webpack.config.path.js'}, 'build-mergeCustomConfig-path');
  });
  it('should support dedupe', () => {
    return testBuild({}, 'build-dedupePlugin-enabled');
  });
  it('should support hash map', () => {
    return testBuild({hash:true}, 'build-hash-map');
  });
  it('should support i18n', () => {
    return testBuild({}, 'build-i18n');
  });
  it('should support decorator', () => {
    return testBuild({}, 'build-decorator');
  });
  it('should support es3', () => {
    return testBuild({}, 'build-es3');
  });
  it('should support typescript', () => {
    return testBuild({}, 'build-typescript');
  });
  it('should support theme', () => {
    return testBuild({}, 'build-theme');
  });
  it('should build outputPath', () => {
    return testBuild({outputPath: './www'}, 'build-outputPath');
  });
  it('should build publicPath', () => {
    return testBuild({publicPath: 'http:test.com/'}, 'build-publicPath');
  });
  it('should build record json', () => {
    return testBuild({json:'./dist'}, 'build-record-json');
  });
});
