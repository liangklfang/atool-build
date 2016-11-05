import { join } from 'path';
import { readFileSync } from 'fs';
import expect from 'expect';
import transformLess from '../src/transform/transformLess';

const cwd = process.cwd();

xdescribe('lib/transformLess', () => {
  it('should build normally', () => {
    return transformLess('./test/fixtures/transformLess/a.less', { cwd })
      .then(result => {
        const expected = readFileSync(join(cwd, './test/expect/transformLess/a.css'), 'utf-8')
        expect(result).toEqual(expected);
      });
  });
});
