import { expect } from '@esm-bundle/chai';
import { sendMouse, resetMouse } from '@web/test-runner-commands';
import { ResponsiveEmbed } from '../index.js';

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
// MutationObserver callbacks run as microtasks; a macrotask is enough to flush them.
const settle = () => new Promise((resolve) => setTimeout(resolve));

let container;

function mount(html, width = 320) {
  container = document.createElement('div');
  container.style.width = `${width}px`;
  container.innerHTML = html;
  document.body.append(container);
  return container.firstElementChild;
}

function height(element) {
  return element.getBoundingClientRect().height;
}

let warnings;
const originalWarn = console.warn;

beforeEach(() => {
  warnings = [];
  console.warn = (...args) => warnings.push(args);
});

afterEach(() => {
  console.warn = originalWarn;
  container?.remove();
  container = undefined;
});

describe('<responsive-embed>', () => {
  it('is registered by the entry point', () => {
    expect(document.createElement('responsive-embed')).to.be.instanceOf(ResponsiveEmbed);
  });

  describe('ratio attribute', () => {
    it('defaults to 16:9', () => {
      const el = mount('<responsive-embed><iframe></iframe></responsive-embed>');
      expect(el.aspectRatio).to.equal(16 / 9);
      expect(height(el)).to.equal(180);
    });

    const cases = { '16:9': 180, '4/3': 240, '21:9': 320 * 9 / 21, '1': 320, '2': 160, '2.35': 320 / 2.35 };
    for (const [ratio, expected] of Object.entries(cases)) {
      it(`sizes ratio="${ratio}"`, () => {
        const el = mount(`<responsive-embed ratio="${ratio}"><iframe></iframe></responsive-embed>`);
        expect(height(el)).to.be.closeTo(expected, 0.5);
      });
    }

    it('reacts to attribute changes', () => {
      const el = mount('<responsive-embed ratio="16:9"><iframe></iframe></responsive-embed>');
      el.setAttribute('ratio', '1:1');
      expect(el.aspectRatio).to.equal(1);
      expect(height(el)).to.equal(320);
      el.setAttribute('ratio', '4/3');
      expect(height(el)).to.equal(240);
    });

    it('reflects the ratio property to the attribute', () => {
      const el = mount('<responsive-embed><iframe></iframe></responsive-embed>');
      el.ratio = '1:1';
      expect(el.getAttribute('ratio')).to.equal('1:1');
      expect(height(el)).to.equal(320);
      el.ratio = null;
      expect(el.hasAttribute('ratio')).to.equal(false);
      expect(el.aspectRatio).to.equal(16 / 9);
    });

    it('goes back to inference when the attribute is removed', () => {
      const el = mount(
        '<responsive-embed ratio="1:1"><iframe width="400" height="300"></iframe></responsive-embed>',
      );
      expect(el.aspectRatio).to.equal(1);
      el.removeAttribute('ratio');
      expect(el.aspectRatio).to.equal(4 / 3);
    });

    it('works when created and configured from script before being connected', () => {
      const el = document.createElement('responsive-embed');
      el.ratio = '2';
      el.append(document.createElement('iframe'));
      container = document.createElement('div');
      container.style.width = '320px';
      container.append(el);
      document.body.append(container);
      expect(height(el)).to.equal(160);
    });

    it('lets an aspect-ratio set from outside win', () => {
      const el = mount(
        '<responsive-embed ratio="16:9" style="aspect-ratio: 1"><iframe></iframe></responsive-embed>',
      );
      expect(height(el)).to.equal(320);
    });
  });

  describe('invalid ratio', () => {
    it('warns and falls back to the default', () => {
      const el = mount('<responsive-embed ratio="wide"><iframe></iframe></responsive-embed>');
      expect(el.aspectRatio).to.equal(16 / 9);
      expect(warnings).to.have.length(1);
      expect(warnings[0][0]).to.contain('invalid ratio "wide"');
    });

    it('warns and falls back to the inferred ratio', () => {
      const el = mount(
        '<responsive-embed ratio="16x9"><iframe width="400" height="300"></iframe></responsive-embed>',
      );
      expect(el.aspectRatio).to.equal(4 / 3);
      expect(warnings).to.have.length(1);
    });

    it('warns when an invalid value is set later', () => {
      const el = mount('<responsive-embed ratio="1:1"><iframe></iframe></responsive-embed>');
      expect(warnings).to.have.length(0);
      el.setAttribute('ratio', '16:0');
      expect(el.aspectRatio).to.equal(16 / 9);
      expect(warnings).to.have.length(1);
    });

    it('treats an empty attribute as absent, without warning', () => {
      const el = mount('<responsive-embed ratio=""><iframe width="1" height="1"></iframe></responsive-embed>');
      expect(el.aspectRatio).to.equal(1);
      expect(warnings).to.have.length(0);
    });
  });

  describe('inference from width/height', () => {
    it('reads the YouTube snippet dimensions', () => {
      const el = mount(
        '<responsive-embed><iframe width="560" height="315" src="about:blank"></iframe></responsive-embed>',
      );
      expect(el.aspectRatio).to.equal(560 / 315);
      expect(height(el)).to.equal(180);
    });

    it('accepts px values and ignores percentages', () => {
      const px = mount('<responsive-embed><iframe width="400px" height="300px"></iframe></responsive-embed>');
      expect(px.aspectRatio).to.equal(4 / 3);
      container.remove();
      const pct = mount('<responsive-embed><iframe width="100%" height="300"></iframe></responsive-embed>');
      expect(pct.aspectRatio).to.equal(16 / 9);
    });

    it('uses the first child that has both dimensions', () => {
      const el = mount(
        '<responsive-embed><span></span><video width="100" height="100"></video></responsive-embed>',
      );
      expect(el.aspectRatio).to.equal(1);
    });

    it('prefers an explicit ratio attribute', () => {
      const el = mount(
        '<responsive-embed ratio="21:9"><iframe width="560" height="315"></iframe></responsive-embed>',
      );
      expect(el.aspectRatio).to.equal(21 / 9);
    });

    it('follows changes to the child dimensions', async () => {
      const el = mount('<responsive-embed><iframe width="560" height="315"></iframe></responsive-embed>');
      el.querySelector('iframe').setAttribute('height', '560');
      await settle();
      expect(el.aspectRatio).to.equal(1);
      expect(height(el)).to.equal(320);
    });

    it('follows content added after connection', async () => {
      const el = mount('<responsive-embed></responsive-embed>');
      expect(el.aspectRatio).to.equal(16 / 9);
      el.innerHTML = '<iframe width="300" height="400"></iframe>';
      await settle();
      expect(el.aspectRatio).to.equal(3 / 4);
    });
  });

  describe('content', () => {
    const svg = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22/>';
    const children = {
      iframe: '<iframe></iframe>',
      video: '<video></video>',
      object: `<object type="image/svg+xml" data='${svg}'></object>`,
      embed: `<embed type="image/svg+xml" src='${svg}'>`,
      img: `<img alt="" src='${svg}'>`,
      div: '<div></div>',
    };
    for (const [tag, html] of Object.entries(children)) {
      it(`stretches <${tag}> to fill the box`, () => {
        const el = mount(`<responsive-embed ratio="4:3">${html}</responsive-embed>`);
        const child = el.firstElementChild;
        const box = el.getBoundingClientRect();
        const rect = child.getBoundingClientRect();
        expect(rect.width).to.equal(box.width);
        expect(rect.height).to.equal(box.height);
        expect(rect.top).to.equal(box.top);
        expect(rect.left).to.equal(box.left);
      });
    }

    it('removes the iframe border', () => {
      const el = mount('<responsive-embed><iframe></iframe></responsive-embed>');
      expect(getComputedStyle(el.firstElementChild).borderTopWidth).to.equal('0px');
    });

    it('respects the hidden attribute', () => {
      const el = mount('<responsive-embed hidden><iframe></iframe></responsive-embed>');
      expect(height(el)).to.equal(0);
    });
  });

  describe('user classes and styles', () => {
    it('never touches the class or style attributes', async () => {
      const el = mount(
        '<responsive-embed class="card  shadow" style="margin: 1px"><iframe width="4" height="3"></iframe></responsive-embed>',
      );
      el.setAttribute('ratio', '1:1');
      el.setAttribute('ratio', 'bogus');
      el.removeAttribute('ratio');
      el.firstElementChild.setAttribute('width', '8');
      await settle();
      expect(el.getAttribute('class')).to.equal('card  shadow');
      expect(el.getAttribute('style')).to.equal('margin: 1px');
    });

    it('keeps classes added at runtime', () => {
      const el = mount('<responsive-embed><iframe></iframe></responsive-embed>');
      el.classList.add('mine');
      el.setAttribute('ratio', '1:1');
      el.setAttribute('ratio', '21:9');
      expect([...el.classList]).to.deep.equal(['mine']);
    });

    it('does not add any legacy v16-9 style classes', () => {
      const el = mount('<responsive-embed ratio="16:9"><iframe></iframe></responsive-embed>');
      expect(el.hasAttribute('class')).to.equal(false);
    });
  });

  describe('lifecycle', () => {
    it('keeps working after being moved in the DOM', async () => {
      const el = mount('<responsive-embed><iframe width="1" height="1"></iframe></responsive-embed>');
      const other = document.createElement('div');
      other.style.width = '200px';
      container.append(other);
      other.append(el);
      el.firstElementChild.setAttribute('width', '2');
      await settle();
      expect(el.aspectRatio).to.equal(2);
      expect(height(el)).to.equal(100);
    });
  });

  describe('fullscreen', () => {
    afterEach(async () => {
      await resetMouse();
      if (document.fullscreenElement) await document.exitFullscreen();
    });

    it('lets the embedded iframe go fullscreen at the viewport size', async () => {
      const el = mount(
        '<responsive-embed ratio="4:3"><iframe srcdoc="<p>hi</p>" allowfullscreen></iframe></responsive-embed>',
      );
      const iframe = el.firstElementChild;
      const button = document.createElement('button');
      button.textContent = 'fullscreen';
      button.style.cssText = 'position: fixed; top: 0; left: 0; width: 100px; height: 40px;';
      container.append(button);

      const entered = new Promise((resolve, reject) => {
        button.addEventListener('click', () => iframe.requestFullscreen().then(resolve, reject));
      });
      await sendMouse({ type: 'click', position: [20, 20] });
      await entered;
      await nextFrame();

      expect(document.fullscreenElement).to.equal(iframe);
      const rect = iframe.getBoundingClientRect();
      expect(rect.width).to.equal(window.innerWidth);
      expect(rect.height).to.equal(window.innerHeight);

      await document.exitFullscreen();
      await nextFrame();
      expect(iframe.getBoundingClientRect().height).to.equal(240);
    });
  });
});
