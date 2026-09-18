/**
 * Registers <responsive-embed> and re-exports the class.
 *
 *   import 'responsive-embed';
 *
 * Registration is skipped when the tag name is already defined, so loading
 * the package twice (two bundles, a CDN copy and an npm copy...) is harmless.
 * Import `responsive-embed/responsive-embed.js` to get the class without
 * registering anything.
 */
import { ResponsiveEmbed } from './responsive-embed.js';

export * from './responsive-embed.js';

if (globalThis.customElements) ResponsiveEmbed.define();
