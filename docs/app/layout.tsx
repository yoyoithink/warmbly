import './global.css';
import { Inter } from 'next/font/google';
import { Provider } from '@/components/shared/provider';
import { KeyboardShortcutsProvider } from '@/components/shared/KeyboardShortcutsProvider';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://docs.warmbly.com'),
  title: {
    template: '%s | Warmbly 中文文档',
    default: 'Warmbly 中文文档',
  },
  description: 'Warmbly 操作指南与 API 参考：邮箱预热、冷邮件外联与 CRM。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>
          <KeyboardShortcutsProvider>
            {children}
          </KeyboardShortcutsProvider>
        </Provider>
      </body>
    </html>
  );
}
