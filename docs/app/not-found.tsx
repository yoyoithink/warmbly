import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { BookOpen, Braces, GraduationCap, Wrench } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '未找到页面',
  robots: { index: false },
};

const sections = [
  {
    href: '/guides/mailboxes/',
    icon: BookOpen,
    title: '操作指南',
    description: '了解产品各项功能的使用方法。',
  },
  {
    href: '/learn/email-warmup/',
    icon: GraduationCap,
    title: '基础知识',
    description: '冷邮件与邮件送达能力基础。',
  },
  {
    href: '/api/',
    icon: Braces,
    title: 'API 参考',
    description: '通过身份验证，以编程方式操作 Warmbly。',
  },
  {
    href: '/development/architecture/',
    icon: Wrench,
    title: '开发文档',
    description: '自托管、部署和开发 Warmbly。',
  },
];

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-fd-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fd-foreground">
          未找到页面
        </h1>
        <p className="mt-3 max-w-md text-[15px] text-fd-muted-foreground">
          你要访问的页面不存在或已移至其他位置。可以搜索（按 <kbd className="rounded-md border border-fd-border bg-fd-muted px-1.5 py-0.5 font-mono text-xs">/</kbd>），
          或返回以下文档分类。
        </p>
        <div className="mt-10 grid w-full max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-lg border border-fd-border bg-fd-card p-4 text-left transition-colors hover:border-fd-primary/40 hover:bg-fd-accent"
            >
              <section.icon className="size-4 text-fd-primary" />
              <p className="mt-2.5 text-sm font-medium text-fd-foreground">{section.title}</p>
              <p className="mt-1 text-[13px] leading-snug text-fd-muted-foreground">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </HomeLayout>
  );
}
