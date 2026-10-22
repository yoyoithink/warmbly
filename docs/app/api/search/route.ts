import { source } from '@/lib/source';
import { buildChinesePageIndex, createChineseTokenizer } from '@/lib/search-zh';
import { findPath } from 'fumadocs-core/page-tree';
import { createFromSource } from 'fumadocs-core/search/server';

// Build the search index at build time and serve it as a static JSON, so search
// works on a statically-exported / CDN-hosted build (no running server route).
// The provider's client uses `type: 'static'` and loads this
// index once and runs Orama in the browser.
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source, {
  tokenizer: createChineseTokenizer(),
  buildIndex(page) {
    const tree = source.getPageTree(page.locale);
    const path = findPath(tree.children, (node) => node.type === 'page' && node.url === page.url);
    const breadcrumbs = path
      ? [tree.name, ...path.slice(0, -1).map((node) => node.name)]
        .filter((name): name is string => typeof name === 'string' && name.length > 0)
      : undefined;
    return buildChinesePageIndex(page, breadcrumbs);
  },
  // Only relevance ranking is used; omit the unused sort table from the static export.
  sort: { enabled: false },
});
