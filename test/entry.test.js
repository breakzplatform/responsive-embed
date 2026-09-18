import { expect } from '@esm-bundle/chai';

class Foreign extends HTMLElement {}
customElements.define('responsive-embed', Foreign);

describe('entry point with the name already taken', () => {
  it('imports without throwing and leaves the existing definition alone', async () => {
    const module = await import('../index.js');
    expect(module.ResponsiveEmbed).to.be.a('function');
    expect(customElements.get('responsive-embed')).to.equal(Foreign);
  });
});
