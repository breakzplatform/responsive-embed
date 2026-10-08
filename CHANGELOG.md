# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project
uses [Semantic Versioning](https://semver.org/).

## [2.0.1] - 2026-10-08

### Changed

- The package homepage on npm now points to the demo at
  https://responsive-embed.joselito.dev/. No code changes.

## [2.0.0] - 2026-10-08

A rewrite from scratch. 1.x was a Polymer 1 element loaded through HTML
Imports and Bower, none of which works in a current browser. 2.0 is a plain
custom element in a single ES module, with no dependencies and no build step.

### Breaking changes

- The package is now an ES module (`import 'responsive-embed'`). Polymer,
  `webcomponents.js`, HTML Imports and the Bower package are gone.
- `changeRatio()` is removed. Set the `ratio` attribute or property instead.
- The internal `v16-9`, `v21-9`, `v4-3` and `v1-1` classes are removed. The
  element no longer writes to its `class` attribute (1.x cleared any class the
  page had set on it).
- An invalid `ratio` now logs a `console.warn` instead of silently becoming
  16:9.
- Requires custom elements, shadow DOM, CSS `aspect-ratio` and constructable
  stylesheets: Chrome/Edge 88+, Firefox 101+, Safari 16.4+.

### Added

- Any ratio: `16:9`, `4/3`, `2.35` or `1`, with optional spaces around the
  separator. 1.x accepted only `16:9`, `21:9`, `4:3` and `1:1`.
- Ratio inference: without a `ratio` attribute, the element uses the numeric
  `width` and `height` of its first child, so a pasted YouTube or Vimeo
  snippet gets the right ratio with no configuration. 16:9 remains the last
  fallback.
- Live updates: changing the `ratio` attribute or property, the child's
  `width`/`height`, or the children themselves resizes the box immediately.
- Any child element is sized (`iframe`, `video`, `object`, `embed`, `img`,
  `div`...), not only `iframe`, `object` and `embed`.
- Guarded registration: importing the package when `<responsive-embed>` is
  already defined does nothing instead of throwing.
- `responsive-embed/responsive-embed.js` exports the class without
  registering it, and `ResponsiveEmbed.define(tagName, registry)` registers it
  under another name or in another registry.
- `aspectRatio` read-only property, plus the `parseRatio`, `inferRatio` and
  `DEFAULT_RATIO` exports.
- TypeScript declarations, including `HTMLElementTagNameMap`.
- The module can be imported in Node (for example during server-side
  rendering) without throwing.
- A demo page, a test suite running in headless Chrome, and CI.

### Fixed

- The package now ships an actual `LICENSE` file (Apache-2.0, as declared).
- `repository`, `bugs` and `homepage` point to the current GitHub account.

## [1.0.0] - 2016-02-02

- Migrated to Polymer 1.0 and published to npm.

[2.0.1]: https://github.com/breakzplatform/responsive-embed/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/breakzplatform/responsive-embed/compare/1.0.0...v2.0.0
[1.0.0]: https://github.com/breakzplatform/responsive-embed/releases/tag/1.0.0
