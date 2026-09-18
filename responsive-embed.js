/**
 * <responsive-embed> keeps its content (an iframe, video, object, embed or
 * anything else) at a fixed aspect ratio while the width follows the layout.
 *
 * This module only exports the class. Import `responsive-embed` (index.js) to
 * also register the `<responsive-embed>` tag.
 */

export const DEFAULT_RATIO = 16 / 9;

const NUMBER = String.raw`\d+(?:\.\d+)?|\.\d+`;
const RATIO_PATTERN = new RegExp(
  String.raw`^\s*(${NUMBER})\s*(?:[:/]\s*(${NUMBER})\s*)?$`,
);
const DIMENSION_PATTERN = new RegExp(String.raw`^\s*(${NUMBER})\s*(?:px)?\s*$`);

/**
 * Parses an aspect ratio written as `16:9`, `4/3`, `2.35` or `1`.
 *
 * @param {unknown} value
 * @returns {number | null} width divided by height, or null when invalid.
 */
export function parseRatio(value) {
  if (typeof value !== 'string') return null;
  const match = RATIO_PATTERN.exec(value);
  if (!match) return null;
  const width = Number(match[1]);
  const height = match[2] === undefined ? 1 : Number(match[2]);
  const ratio = width / height;
  return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
}

/**
 * Reads a numeric `width` or `height` attribute (`560`, `315px`).
 * Percentages and other units are ignored.
 *
 * @param {Element} element
 * @param {'width' | 'height'} name
 * @returns {number | null}
 */
function readDimension(element, name) {
  const match = DIMENSION_PATTERN.exec(element.getAttribute(name) ?? '');
  const value = match ? Number(match[1]) : NaN;
  return value > 0 && Number.isFinite(value) ? value : null;
}

/**
 * Infers the ratio from the first child element that declares both a numeric
 * `width` and `height`, like the snippets YouTube and Vimeo hand out.
 *
 * @param {Element} host
 * @returns {number | null}
 */
export function inferRatio(host) {
  for (const child of host.children) {
    if (child.hasAttribute('slot')) continue;
    const width = readDimension(child, 'width');
    const height = readDimension(child, 'height');
    if (width && height) return width / height;
  }
  return null;
}

const STYLES = `
  :host {
    display: block;
    position: relative;
  }
  :host([hidden]) {
    display: none;
  }
  ::slotted(*) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    border: 0;
  }
`;

// Lets the module be imported during server-side rendering, where
// HTMLElement does not exist. The element itself only works in a browser.
const Base = globalThis.HTMLElement ?? class {};

export class ResponsiveEmbed extends Base {
  static observedAttributes = ['ratio'];

  /**
   * Registers the element, unless the name is already taken. Custom element
   * names are global, so defining the same name twice throws; this makes a
   * second copy of the package on the page harmless.
   *
   * @param {string} [tagName]
   * @param {CustomElementRegistry} [registry]
   * @returns {CustomElementConstructor} the constructor registered under the name.
   */
  static define(tagName = 'responsive-embed', registry = globalThis.customElements) {
    const existing = registry.get(tagName);
    if (existing) return existing;
    registry.define(tagName, this);
    return this;
  }

  static #sheet;

  #ratio = null;
  #ratioSheet = new CSSStyleSheet();
  #observer = new MutationObserver(() => this.#update());

  constructor() {
    super();
    if (!ResponsiveEmbed.#sheet) {
      ResponsiveEmbed.#sheet = new CSSStyleSheet();
      ResponsiveEmbed.#sheet.replaceSync(STYLES);
    }
    const root = this.attachShadow({ mode: 'open' });
    // The applied ratio lives in a stylesheet inside the shadow root, so the
    // element never writes to the host's own `style` or `class` attributes,
    // and any aspect-ratio set on the element from outside still wins.
    root.adoptedStyleSheets = [ResponsiveEmbed.#sheet, this.#ratioSheet];
    root.append(document.createElement('slot'));
  }

  connectedCallback() {
    this.#observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['width', 'height', 'slot'],
    });
    this.#update();
  }

  disconnectedCallback() {
    this.#observer.disconnect();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // setAttribute() with the value already there still lands here; skip it
    // so repeated writes of an invalid ratio do not warn again.
    if (oldValue === newValue) return;
    this.#update(true);
  }

  /** The `ratio` attribute, as written (`16:9`, `4/3`, `2.35`...). */
  get ratio() {
    return this.getAttribute('ratio');
  }

  set ratio(value) {
    if (value === null || value === undefined) this.removeAttribute('ratio');
    else this.setAttribute('ratio', String(value));
  }

  /** The ratio currently applied, as width divided by height. */
  get aspectRatio() {
    return this.#ratio ?? DEFAULT_RATIO;
  }

  #update(ratioAttributeChanged = false) {
    const attribute = this.getAttribute('ratio');
    let ratio = null;

    if (attribute !== null && attribute.trim() !== '') {
      ratio = parseRatio(attribute);
      if (ratio === null && ratioAttributeChanged) {
        console.warn(
          `<${this.localName}>: invalid ratio "${attribute}". ` +
            'Use a value like "16:9", "4/3" or "2.35". ' +
            'Falling back to the width/height of the content, or 16:9.',
          this,
        );
      }
    }

    ratio ??= inferRatio(this) ?? DEFAULT_RATIO;
    if (ratio === this.#ratio) return;
    this.#ratio = ratio;
    this.#ratioSheet.replaceSync(`:host { aspect-ratio: ${ratio}; }`);
  }
}
