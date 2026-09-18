/** The ratio used when neither the `ratio` attribute nor the content gives one: 16 / 9. */
export declare const DEFAULT_RATIO: number;

/**
 * Parses an aspect ratio written as `16:9`, `4/3`, `2.35` or `1`.
 * Returns width divided by height, or `null` when the value is invalid.
 */
export declare function parseRatio(value: unknown): number | null;

/**
 * Returns the ratio of the first child element of `host` that has numeric
 * `width` and `height` attributes, or `null` when there is none.
 */
export declare function inferRatio(host: Element): number | null;

export declare class ResponsiveEmbed extends HTMLElement {
  static observedAttributes: string[];

  /**
   * Registers the element under `tagName` unless that name is already taken.
   * Returns the constructor registered under the name.
   */
  static define(tagName?: string, registry?: CustomElementRegistry): CustomElementConstructor;

  /** The `ratio` attribute as written, or `null`. Setting `null` removes it. */
  ratio: string | null;

  /** The ratio currently applied, as width divided by height. */
  readonly aspectRatio: number;
}
