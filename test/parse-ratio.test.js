import { expect } from '@esm-bundle/chai';
import { parseRatio, DEFAULT_RATIO } from '../responsive-embed.js';

describe('parseRatio', () => {
  const valid = {
    '16:9': 16 / 9,
    '4/3': 4 / 3,
    '21:9': 21 / 9,
    '1:1': 1,
    '2.35': 2.35,
    '1': 1,
    '.5': 0.5,
    '2.39:1': 2.39,
    ' 16 : 9 ': 16 / 9,
    '16 / 9': 16 / 9,
    '1.85/1': 1.85,
  };

  for (const [input, expected] of Object.entries(valid)) {
    it(`parses ${JSON.stringify(input)}`, () => {
      expect(parseRatio(input)).to.be.closeTo(expected, 1e-12);
    });
  }

  const invalid = [
    '', ' ', 'wide', '16x9', '16:9:1', '16:', ':9', '-16:9', '16:-9',
    '0', '0:9', '16:0', '1e3', 'NaN', 'Infinity', '16px', '4 3',
  ];

  for (const input of invalid) {
    it(`rejects ${JSON.stringify(input)}`, () => {
      expect(parseRatio(input)).to.equal(null);
    });
  }

  it('rejects non-strings', () => {
    expect(parseRatio(null)).to.equal(null);
    expect(parseRatio(undefined)).to.equal(null);
    expect(parseRatio(1.5)).to.equal(null);
  });

  it('defaults to 16:9', () => {
    expect(DEFAULT_RATIO).to.equal(16 / 9);
  });
});
