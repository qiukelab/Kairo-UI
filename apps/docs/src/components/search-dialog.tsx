import { create } from '@orama/orama';
import { useRouterState } from '@tanstack/react-router';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { oramaStaticClient } from 'fumadocs-core/search/client/orama-static';
import {
  SearchDialog as SearchDialogPrimitive,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { localeFromPathname } from '@/lib/i18n';
import { createThaiTokenizer } from '@/lib/thai-tokenizer';

/**
 * Custom search dialog wired to a build-time static index per locale (see
 * `src/routes/static-search-en[.]json.ts` and `static-search-th[.]json.ts`)
 * instead of a runtime search API route — there is no server to query on a
 * fully static/prerendered site.
 *
 * For Thai, the client must reconstruct the Orama database with the exact
 * same custom tokenizer used to build the index (`initOrama`) — Orama's
 * `load()` restores the index/documents but not component functions like the
 * tokenizer, which can't be serialized to JSON, so the shell db created here
 * has to bring its own matching tokenizer or Thai queries would be
 * tokenized differently than the indexed content and never match.
 */
export function SearchDialog(props: SharedProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const locale = localeFromPathname(pathname);

  const { search, setSearch, query } = useDocsSearch(
    {
      client: oramaStaticClient(
        locale === 'th'
          ? {
              from: '/static-search-th.json',
              initOrama: () =>
                create({
                  schema: { _: 'string' },
                  components: { tokenizer: createThaiTokenizer() },
                }),
            }
          : { from: '/static-search-en.json' },
      ),
    },
    [locale],
  );

  return (
    <SearchDialogPrimitive
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
        <SearchDialogFooter />
      </SearchDialogContent>
    </SearchDialogPrimitive>
  );
}
