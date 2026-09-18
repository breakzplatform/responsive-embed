import type { ResponsiveEmbed } from './responsive-embed.js';

export * from './responsive-embed.js';

declare global {
  interface HTMLElementTagNameMap {
    'responsive-embed': ResponsiveEmbed;
  }
}
