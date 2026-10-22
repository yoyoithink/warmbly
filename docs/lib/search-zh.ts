import type { StaticOptions } from 'fumadocs-core/search/client';
import type { AdvancedIndex, AdvancedOptions } from 'fumadocs-core/search/server';

// The same deterministic tokenizer runs at build time and in the browser.
export function createChineseTokenizer() {
  return {
    language: 'zh-CN',
    normalizationCache: new Map<string, string>(),
    tokenize(raw: string, _language?: string, prop?: string): string[] {
      const tokens = new Set<string>();
      const parts = raw.normalize('NFKC').toLowerCase().match(/[\p{Script=Han}]+|[a-z\u00c0-\u024f0-9_'-]+/gu) ?? [];
      for (const part of parts) {
        if (!/\p{Script=Han}/u.test(part)) {
          tokens.add(part.normalize('NFKD').replace(/\p{M}/gu, ''));
          continue;
        }
        const chars = Array.from(part);
        // Prefix search finds each character at the start of an adjacent pair.
        // Keep the final character too, so single-character searches remain complete
        // without storing a second posting for every character in the document.
        if (prop !== undefined || chars.length === 1) {
          tokens.add(chars[chars.length - 1]);
        }
        for (let i = 0; i + 1 < chars.length; i++) tokens.add(chars[i] + chars[i + 1]);
      }
      return [...tokens];
    },
  } satisfies NonNullable<AdvancedOptions['tokenizer']>;
}

export function buildChinesePageIndex(
  page: { url: string; data: Pick<AdvancedIndex, 'title' | 'description' | 'structuredData'> },
  breadcrumbs?: string[],
): AdvancedIndex {
  const contents: AdvancedIndex['structuredData']['contents'] = [];
  for (const item of page.data.structuredData.contents) {
    const previous = contents.at(-1);
    // Fumadocs emits a separate search item for every table cell. Merge only
    // adjacent items under the same heading, retaining all text and its anchor.
    if (previous && previous.heading === item.heading) {
      previous.content += `\n${item.content}`;
    } else {
      contents.push({ ...item });
    }
  }
  return {
    id: page.url,
    url: page.url,
    title: page.data.title,
    description: page.data.description,
    breadcrumbs,
    structuredData: { ...page.data.structuredData, contents },
  };
}

// Use Fumadocs' public plugin hook so Orama remains an existing transitive dependency.
export async function initChineseSearch() {
  const { initAdvancedSearch } = await import('fumadocs-core/search/server');
  type Database = Awaited<ReturnType<NonNullable<StaticOptions['initOrama']>>>;
  let database: Database | undefined;
  const emptyIndex = initAdvancedSearch({
    indexes: [],
    tokenizer: createChineseTokenizer(),
    sort: { enabled: false },
    plugins: [{
      name: 'warmbly-chinese-search',
      afterCreate(db) {
        database = db;
      },
    }],
  });
  await emptyIndex.export();
  if (!database) throw new Error('无法初始化文档搜索。');
  return database;
}
