# &lt;responsive-embed&gt;

A tiny, dependency-free custom element that keeps an iframe, video or any other
embed at a fixed aspect ratio while its width follows the layout.

```html
<responsive-embed>
  <iframe width="560" height="315" src="https://www.youtube.com/embed/fCLMI5TCcqg" allowfullscreen></iframe>
</responsive-embed>
```

Paste the embed code you were given, wrap it, done. The ratio comes from the
`width` and `height` the snippet already has.

[Demo](https://breakzplatform.github.io/responsive-embed/demo/)

## When not to use this

If you know the ratio up front and you control the CSS, you do not need this
package. Plain CSS does the job:

```css
.video {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}
```

`<responsive-embed>` is worth it when:

- you paste third-party embed code (YouTube, Vimeo, maps, slides...) and want
  the ratio taken from its `width`/`height` instead of writing CSS per embed;
- the ratio is data (from a CMS, an API) and a `ratio="..."` attribute is the
  simplest place to put it;
- you want one declarative wrapper that behaves the same for `iframe`,
  `video`, `object`, `embed` or anything else.

## Install

```shell
npm install responsive-embed
```

```js
import 'responsive-embed';
```

Or straight from a CDN, no build step:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/responsive-embed@2"></script>
```

## Usage

### Explicit ratio

```html
<responsive-embed ratio="21:9">
  <iframe src="..." allowfullscreen></iframe>
</responsive-embed>
```

`ratio` accepts `width:height`, `width/height` or a single number:

| Value            | Ratio       |
| ---------------- | ----------- |
| `16:9`           | 16 / 9      |
| `4/3`            | 4 / 3       |
| `2.35`           | 2.35 / 1    |
| `1`              | square      |

Spaces around the separator are allowed (`16 / 9`).

### Inferred ratio

Without a `ratio` attribute, the element uses the first child that has numeric
`width` and `height` attributes (`560`, `315px`; percentages are ignored).
If there is none, it uses 16:9.

The ratio is resolved in this order:

1. a valid `ratio` attribute;
2. the child's `width`/`height`;
3. 16:9.

An invalid `ratio` (for example `16x9`) is never ignored silently: the element
logs a `console.warn` and falls back to steps 2 and 3.

### Reactive

Everything is live. Changing the `ratio` attribute or property, or the child's
`width`/`height`, or swapping the child, resizes the box immediately.

```js
const embed = document.querySelector('responsive-embed');
embed.ratio = '4/3';        // same as setAttribute('ratio', '4/3')
embed.ratio = null;         // removes the attribute, back to inference
embed.aspectRatio;          // the ratio in use, as a number: 1.333...
```

### Any content

The first-level children are stretched to fill the box, whatever they are:
`iframe`, `video`, `object`, `embed`, `img`, a `div`. Fullscreen works as
usual; the browser lifts the fullscreen element out of the box.

### Styling

The element is a `display: block` box sized with CSS `aspect-ratio`. It never
adds, removes or rewrites your `class` or `style` attributes, and CSS you
write on the element wins over its defaults:

```css
responsive-embed {
  max-width: 720px;
  margin-inline: auto;
}

/* Force a ratio from CSS instead of the attribute. */
responsive-embed.square {
  aspect-ratio: 1;
}
```

Setting a fixed `height` on the element overrides the ratio, as it does for any
element with `aspect-ratio`.

## API

### Entry points

| Import                                   | Does                                                  |
| ---------------------------------------- | ----------------------------------------------------- |
| `responsive-embed`                       | Registers `<responsive-embed>` and exports the class. |
| `responsive-embed/responsive-embed.js`   | Exports the class only. Registers nothing.            |

Registration is guarded: if `responsive-embed` is already defined (a second copy
of this package, or another library using the name), importing the package
again does nothing instead of throwing.

### Exports

- `ResponsiveEmbed`: the element class.
  - `ResponsiveEmbed.define(tagName = 'responsive-embed', registry = customElements)`
    registers the class unless `tagName` is taken, and returns the constructor
    registered under that name. Use it to pick another tag name.
  - `ratio`: the `ratio` attribute, as a string or `null`.
  - `aspectRatio` (read-only): the ratio in use, as width divided by height.
- `parseRatio(value)`: parses `16:9`, `4/3`, `2.35`... into a number, or
  `null` if invalid.
- `inferRatio(element)`: the ratio from the first child with numeric
  `width`/`height`, or `null`.
- `DEFAULT_RATIO`: `16 / 9`.

TypeScript declarations are included, and `<responsive-embed>` is added to
`HTMLElementTagNameMap`.

### Browser support

Any browser with custom elements, shadow DOM, CSS `aspect-ratio` and
constructable stylesheets: Chrome/Edge 88+, Firefox 101+, Safari 16.4+.
There is no fallback for older browsers.

## Migrating from 1.x

1.x was a Polymer 1 element loaded through HTML Imports and Bower, which no
current browser supports.

- Drop `webcomponents.js` and the `<link rel="import">`; import the module
  instead (see [Install](#install)).
- `ratio="16:9"`, `4:3`, `21:9` and `1:1` keep working, and any other ratio now
  does too.
- `changeRatio('4:3')` is gone. Set the attribute or the `ratio` property.
- The internal `v16-9`, `v21-9`, `v4-3` and `v1-1` classes are gone. The
  element no longer touches the `class` attribute at all.
- An unknown ratio now logs a warning instead of silently becoming 16:9.
- Any child element is sized, not only `iframe`, `object` and `embed`.

## Development

```shell
npm install
npm test        # runs the suite in headless Chrome
npm start       # serves the demo
```

## License

[Apache-2.0](LICENSE)
