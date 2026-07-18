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

/**
 * Custom search dialog wired to a build-time static index (see
 * `src/routes/static-search-en[.]json.ts`) instead of a runtime search API
 * route — there is no server to query on a fully static/prerendered site.
 *
 * Named with an explicit `-en` suffix so a future per-locale index (e.g.
 * `static-search-th.json`, using a Thai-aware tokenizer) can be added
 * alongside it without restructuring this component.
 */
export function SearchDialog(props: SharedProps) {
  const { search, setSearch, query } = useDocsSearch({
    client: oramaStaticClient({ from: '/static-search-en.json' }),
  });

  return (
    <SearchDialogPrimitive search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
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
