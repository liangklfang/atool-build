import { join } from 'path';
import glob from 'glob';
import { readFileSync } from 'fs';
import expect from 'expect';
import transform from '../src/transform/transform';

function assert(actualDir, _expect) {
  const expectDir = join(__dirname, 'expect', _expect);
  const actualFiles = glob.sync('**/*', { cwd: actualDir, nodir: true });

  actualFiles.forEach(file => {
    const actualFile = readFileSync(join(actualDir, file), 'utf-8');
    const expectFile = readFileSync(join(expectDir, file), 'utf-8');
    expect(actualFile).toEqual(expectFile);
  });
}

function testTransform(args, fixture, done) {
  const cwd = join(__dirname, 'fixtures', fixture);
  const dist = args.outputDir || './lib';
  const outputPath = join(cwd, dist);
  process.chdir(cwd);
  const defaultConfig = {
    cwd,
    include: ['./src/**/*.js', './src/**/*.jsx', './src/**/*.less'],
    exclude: [],
    outputDir: dist,
  };

  transform({...defaultConfig, ...args}, () => {
    assert(outputPath, fixture);
    done()
  }).then(() => {})
}

describe('transform', () => {
  it('transform without external webpack config', done => {
    testTransform({}, 'transform', done);
  });
});
