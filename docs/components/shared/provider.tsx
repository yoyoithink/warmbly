'use client';
import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { useDocsSearch } from 'fumadocs-core/search/client';
import {
  SearchDialog, SearchDialogClose, SearchDialogContent, SearchDialogFooter,
  SearchDialogHeader, SearchDialogIcon, SearchDialogInput, SearchDialogList,
  SearchDialogOverlay, type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { initChineseSearch } from '@/lib/search-zh';

// next-themes renders its no-flash script inside a component. The server copy runs
// on load; on the client it is marked a data block so React has nothing to warn about.
const scriptProps = { type: typeof window === 'undefined' ? 'text/javascript' : 'text/plain' };

function ChineseSearchDialog(props: SharedProps) {
  // This is a single-language static index; its key is empty, not a locale prefix.
  const { search, setSearch, query } = useDocsSearch({ type: 'static', initOrama: initChineseSearch });
  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose aria-label="关闭搜索" />
        </SearchDialogHeader>
        {query.error ? <p role="alert" className="px-4 py-3 text-sm">搜索索引加载失败，请检查网络后刷新页面重试。</p> : (
          <SearchDialogList items={query.data === 'empty' ? null : query.data} />
        )}
      </SearchDialogContent>
      <SearchDialogFooter />
    </SearchDialog>
  );
}

export function Provider({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      search={{ SearchDialog: ChineseSearchDialog }}
      i18n={{
        locale: 'zh-CN',
        translations: {
          search: '搜索文档',
          searchNoResult: '未找到相关结果',
          toc: '本页目录',
          tocNoHeadings: '本页没有标题',
          lastUpdate: '最后更新',
          chooseLanguage: '选择语言',
          nextPage: '下一页',
          previousPage: '上一页',
          chooseTheme: '选择主题',
          editOnGithub: '在 GitHub 上编辑',
        },
      }}
      theme={{ defaultTheme: 'light', scriptProps }}
    >
      {children}
    </RootProvider>
  );
}
