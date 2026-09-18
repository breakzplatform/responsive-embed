import { expect } from '@esm-bundle/chai';
import { ResponsiveEmbed } from '../responsive-embed.js';

// Each test file runs in its own page, so the registry starts empty here.

describe('registration', () => {
  it('importing the class module does not register the tag', () => {
    expect(customElements.get('responsive-embed')).to.equal(undefined);
  });

  it('define() registers under the default name and returns the constructor', () => {
    expect(ResponsiveEmbed.define()).to.equal(ResponsiveEmbed);
    expect(customElements.get('responsive-embed')).to.equal(ResponsiveEmbed);
  });

  it('define() accepts a custom tag name', () => {
    class Custom extends ResponsiveEmbed {}
    expect(Custom.define('custom-embed')).to.equal(Custom);
    expect(document.createElement('custom-embed')).to.be.instanceOf(Custom);
  });

  it('define() does not throw when the name is already taken', () => {
    class Other extends HTMLElement {}
    customElements.define('taken-embed', Other);
    expect(() => ResponsiveEmbed.define('taken-embed')).not.to.throw();
    expect(ResponsiveEmbed.define('taken-embed')).to.equal(Other);
  });

  it('loading the entry point twice does not throw', async () => {
    // A query string forces a second, independent module instance, like a
    // second copy of the package on the same page.
    await import('../index.js?copy=1');
    await import('../index.js?copy=2');
    expect(customElements.get('responsive-embed')).to.equal(ResponsiveEmbed);
  });

});
