/**
 * Duck-typed Orama `Tokenizer` (see `@orama/orama`'s `components.tokenizer`),
 * built on `Intl.Segmenter('th', { granularity: 'word' })`.
 *
 * Thai text has no whitespace between words, so Orama's default (whitespace
 * splitting) tokenizer would index — or tokenize a search query against — an
 * entire Thai paragraph as a single token, and search would never match
 * anything. `Intl.Segmenter`'s dictionary-based word segmentation is the
 * only realistic way to split Thai text into searchable tokens without a
 * bundled dictionary dependency.
 *
 * The exact same tokenizer must be used both when building the Thai static
 * search index (`routes/static-search-th[.]json.ts`) and when tokenizing the
 * user's query on the client (`components/search-dialog.tsx`) — if the two
 * disagree on where word boundaries fall, indexed tokens and query tokens
 * will never match.
 *
 * Deliberately typed as a plain structural object (not imported from
 * `@orama/orama`) so this file has no dependency on Orama's own types.
 */
export interface Tokenizer {
  language: string;
  normalizationCache: Map<string, string>;
  tokenize: (raw: string, language?: string, prop?: string, withCache?: boolean) => string[];
}

export function createThaiTokenizer(): Tokenizer {
  const segmenter = new Intl.Segmenter('th', { granularity: 'word' });

  return {
    language: 'th',
    normalizationCache: new Map<string, string>(),
    tokenize(raw) {
      const tokens: string[] = [];
      for (const { segment, isWordLike } of segmenter.segment(raw)) {
        if (isWordLike) tokens.push(segment.toLocaleLowerCase('th'));
      }
      return tokens;
    },
  };
}
