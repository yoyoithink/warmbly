import { Frame, Label, Pill, fill, type Tone } from './frame';
import { cn } from '@/lib/cn';

// SPF, DKIM and DMARC: three checks on one email, the DMARC rollout and the sub-domain pattern.

function Check({ t = 'good' }: { t?: Tone }) {
  return (
    <span className={cn('inline-flex size-5 shrink-0 items-center justify-center rounded-full text-white', fill[t])} aria-hidden="true">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
  );
}

/** One message, and what each record checks on it. */
export function AuthChecks() {
  return (
    <Frame caption="SPF 和 DKIM 验证邮件来源。当其中任一项的域名与可见 From 地址的域名对齐时，DMARC 即通过。">
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-fd-border bg-fd-background font-mono text-[12px]">
          <div className="border-b border-fd-border px-4 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-fd-muted-foreground">一封邮件</div>
          <dl className="space-y-1.5 px-4 py-3">
            <Hdr k="From" v="maya@acme.com" hl />
            <Hdr k="MAIL FROM" v="bounce.acme.com" />
            <Hdr k="DKIM-Signature" v="d=acme.com; s=google" />
            <Hdr k="Subject" v="Quick question" />
          </dl>
        </div>
        <div className="space-y-2.5">
          <Step name="SPF" q="发件服务器是否获准代表 bounce.acme.com 发送邮件？" a="依据该域名的 SPF 记录检查" />
          <Step name="DKIM" q="acme.com 的签名是否有效，邮件在传输途中是否被修改？" a="使用 DNS 中发布的公钥检查" />
          <Step name="DMARC" q="SPF 或 DKIM 域名是否与 From 域名 acme.com 对齐？" a="若未对齐，收件方按你的策略处理：none、quarantine 或 reject" />
        </div>
      </div>
    </Frame>
  );
}

function Hdr({ k, v, hl }: { k: string; v: string; hl?: boolean }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-fd-muted-foreground">{k}</dt>
      <dd className={cn('min-w-0 break-all text-fd-foreground', hl && 'rounded bg-sky-50 px-1 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200')}>{v}</dd>
    </div>
  );
}

function Step({ name, q, a }: { name: string; q: string; a: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-fd-border bg-fd-background px-4 py-3">
      <Check />
      <div className="min-w-0">
        <div className="text-[13.5px] font-medium text-fd-foreground">{name}</div>
        <div className="mt-0.5 text-[12.5px] text-fd-foreground/85">{q}</div>
        <div className="mt-0.5 text-[12px] text-fd-muted-foreground">{a}</div>
      </div>
    </div>
  );
}

const ROLLOUT: { p: string; text: string; t: Tone }[] = [
  { p: 'SPF 和 DKIM', text: '为每个代表你发信的服务发布这两类记录', t: 'plain' },
  { p: 'p=none', text: '仅监测。两周内不作其他更改，并查看报告', t: 'info' },
  { p: 'p=quarantine; pct=25', text: '确保所有发件方均实现域名对齐，然后在一个月内将 pct 逐步提高到 100', t: 'watch' },
  { p: 'p=reject', text: '报告无异常后启用，提供最强的发件冒用防护', t: 'good' },
];

export function DmarcRollout() {
  return (
    <Frame caption="分步实施 DMARC，在拒收之前发现被遗漏的合法发信来源。">
      <ol className="grid gap-2 md:grid-cols-4">
        {ROLLOUT.map((r, i) => (
          <li key={r.p} className="relative rounded-lg border border-fd-border bg-fd-background p-3.5">
            <div className="text-[11px] tabular-nums text-fd-muted-foreground">步骤 {i + 1}</div>
            <div className="mt-1.5"><Pill t={r.t} className="font-mono">{r.p}</Pill></div>
            <div className="mt-2 text-[12.5px] leading-[1.45] text-fd-foreground/85">{r.text}</div>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

const DOMAINS = [
  { d: 'acme.com', use: '事务邮件和人工往来邮件', note: '分步实施后启用 DMARC reject 策略', t: 'good' as Tone },
  { d: 'outreach.acme.com', use: '冷邮件营销活动', note: '独立的 SPF、DKIM 和 DMARC 配置', t: 'info' as Tone },
  { d: 'news.acme.com', use: '电子简报', note: '独立的身份验证与发件信誉', t: 'plain' as Tone },
];

export function SubdomainPattern() {
  return (
    <Frame caption="冷邮件的信誉问题局限于其子域名，不影响公司日常业务使用的邮箱。">
      <div className="grid gap-2 md:grid-cols-3">
        {DOMAINS.map((d) => (
          <div key={d.d} className="rounded-lg border border-fd-border bg-fd-background p-4">
            <div className="font-mono text-[13px] font-medium text-fd-foreground">{d.d}</div>
            <div className="mt-2"><Pill t={d.t}>{d.use}</Pill></div>
            <div className="mt-2 text-[12.5px] text-fd-muted-foreground">{d.note}</div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

const REGIONS: { name: string; law: string; consent: string; t: Tone; points: string[] }[] = [
  {
    name: '美国',
    law: 'CAN-SPAM',
    consent: 'B2B 邮件无需事先同意',
    t: 'good',
    points: ['真实的 From 信息和主题', '有效的实体邮寄地址', '在 10 个工作日内处理退订'],
  },
  {
    name: '欧盟和英国',
    law: 'GDPR 和 PECR',
    consent: 'B2B 可基于合法利益；B2C 需取得同意',
    t: 'watch',
    points: ['具有明确的商业联系理由', '立即处理拒收请求', '说明联系方式的来源'],
  },
  {
    name: '澳大利亚',
    law: 'Spam Act',
    consent: '同意形式：明示、推断或默示',
    t: 'watch',
    points: ['准确的发件人身份信息', '有效的退订方式', 'B2B 的推断同意适用较宽泛'],
  },
  {
    name: '加拿大',
    law: 'CASL',
    consent: '必须取得明示或默示同意',
    t: 'bad',
    points: ['四者中要求最严格', '发件人身份与联系方式', '每次违规最高罚款 CAD $10M'],
  },
];

/** The four regimes side by side, least to most strict. */
export function ComplianceMap() {
  return (
    <Frame caption="仅供一般参考，不构成法律意见。按同意要求从宽到严排列。">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {REGIONS.map((r) => (
          <div key={r.name} className="flex flex-col rounded-lg border border-fd-border bg-fd-background p-4">
            <div className="text-[14px] font-medium text-fd-foreground">{r.name}</div>
            <div className="text-[12px] text-fd-muted-foreground">{r.law}</div>
            <div className="mt-3"><Pill t={r.t}>{r.consent}</Pill></div>
            <ul className="mt-3 space-y-1.5 text-[12.5px] text-fd-foreground/85">
              {r.points.map((p) => (
                <li key={p} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-fd-muted-foreground/40" />{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Label className="mt-4">各地共同要求：真实发件人、明确的拒收方式，并停止向提出拒收的人发送邮件</Label>
    </Frame>
  );
}

const CONTACTS = [
  { name: 'Alex', company: 'Acme', out: 'Hi Alex, I saw Acme is hiring.' },
  { name: 'Sam', company: '', out: 'Hi Sam,' },
];

/** One template, rendered for two contacts. */
export function MergePreview() {
  return (
    <Frame caption="每封邮件都会在发送时按对应收件人渲染，字段缺失也不会留下空缺。">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="rounded-lg border border-fd-border bg-fd-background">
          <div className="border-b border-fd-border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-fd-muted-foreground">模板</div>
          <pre className="whitespace-pre-wrap px-4 py-3 font-mono text-[12.5px] leading-[1.7] text-fd-foreground">
            Hi <V>{'{{.FirstName}}'}</V>,<V>{'{{if .Company}}'}</V> I saw <V>{'{{.Company}}'}</V> is hiring.<V>{'{{end}}'}</V>
          </pre>
        </div>
        <svg width="28" height="14" viewBox="0 0 28 14" fill="none" className="mx-auto text-fd-muted-foreground/60 max-lg:rotate-90" aria-hidden="true">
          <path d="M0 7h25m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="space-y-2">
          {CONTACTS.map((c) => (
            <div key={c.name} className="rounded-lg border border-fd-border bg-fd-background px-4 py-3">
              <div className="text-[11.5px] text-fd-muted-foreground">
                收件人：{c.name} · 公司：{c.company ? <span className="text-fd-foreground">{c.company}</span> : <span className="italic">空白</span>}
              </div>
              <div className="mt-1 text-[13.5px] text-fd-foreground">{c.out}</div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function V({ children }: { children: string }) {
  return <span className="rounded bg-sky-50 px-0.5 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">{children}</span>;
}
