import { Frame, Label, Pill, fill, type Tone } from './frame';
import { cn } from '@/lib/cn';

// Email warmup, warmup pools and reputation recovery.

/** Warmbly's default ramp (10 a day, +1 a day, ceiling 40) against a sudden jump. */
export function WarmupRamp() {
  const W = 560, H = 220, pad = { l: 34, r: 12, t: 14, b: 26 };
  const days = 40, max = 110;
  const x = (d: number) => pad.l + (d / days) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - (v / max) * (H - pad.t - pad.b);
  const good = Array.from({ length: days + 1 }, (_, d) => `${x(d)},${y(Math.min(40, 10 + d))}`).join(' ');
  const bad = `${x(0)},${y(10)} ${x(6)},${y(10)} ${x(7)},${y(100)} ${x(14)},${y(100)}`;
  return (
    <Frame caption="合理的预热应缓慢增加发送量并在达到上限后保持稳定。发送量突增容易呈现机器人行为特征。">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[300px]" role="img" aria-label="每日预热发送量：从 10 封逐步增至 40 封，与突然增至 100 封的对比">
        {[0, 40, 80].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="stroke-fd-border" strokeDasharray={v ? '3 4' : undefined} />
            <text x={pad.l - 6} y={y(v) + 4} textAnchor="end" className="fill-fd-muted-foreground text-[10px]">{v}</text>
          </g>
        ))}
        {[0, 10, 20, 30, 40].map((d) => (
          <text key={d} x={x(d)} y={H - 8} textAnchor="middle" className="fill-fd-muted-foreground text-[10px]">第 {d} 天</text>
        ))}
        <polyline points={bad} fill="none" strokeWidth="2" strokeDasharray="5 4" className="stroke-rose-500" />
        <polyline points={good} fill="none" strokeWidth="2.5" strokeLinejoin="round" className="stroke-emerald-500" />
        <circle cx={x(30)} cy={y(40)} r="3.5" className="fill-emerald-500" />
        <text x={x(31)} y={y(40) - 8} className="fill-emerald-600 text-[11px] font-medium dark:fill-emerald-300">每日上限 40 封</text>
        <text x={x(14) + 6} y={y(100) + 4} className="fill-rose-600 text-[11px] font-medium dark:fill-rose-300">突增至每日 100 封</text>
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] text-fd-muted-foreground">
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 bg-emerald-500" />从 10 封开始，每天增加 1 封，上限 40 封</span>
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 border-t-2 border-dashed border-rose-500" />增至每日 100 封显得不自然</span>
      </div>
    </Frame>
  );
}

const PARTNERS = ['Gmail', 'Outlook', 'Yahoo', 'iCloud'];

/** 你的邮箱 trading short messages with other pool members, who open and reply. */
export function WarmupExchange() {
  return (
    <Frame caption="预热模拟真人开始使用新邮箱的过程：少量发送、打开邮件和回复。">
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-lg border border-fd-border bg-fd-background px-4 py-4 text-center">
          <div className="text-[14px] font-medium text-fd-foreground">你的邮箱</div>
          <div className="mt-1 text-[12.5px] text-fd-muted-foreground">发送简短的纯文本邮件</div>
        </div>
        <div className="flex flex-col items-center gap-2 text-[12px] text-fd-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Dir />发送</span>
          <span className="inline-flex items-center gap-1.5"><Dir back />打开邮件，约 30% 会得到回复</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PARTNERS.map((p) => (
            <div key={p} className="rounded-lg border border-fd-border bg-fd-background px-3 py-2.5 text-center">
              <div className="text-[13px] font-medium text-fd-foreground">{p}</div>
              <div className="text-[11.5px] text-fd-muted-foreground">预热池邮箱</div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function Dir({ back }: { back?: boolean }) {
  return (
    <svg width="34" height="10" viewBox="0 0 34 10" fill="none" className={cn('text-fd-muted-foreground/70', back && 'rotate-180')} aria-hidden="true">
      <path d="M0 5h31m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const HEALTH: { name: string; t: Tone; when: string; does: string }[] = [
  { name: '观察', t: 'info', when: '垃圾邮件文件夹占比达到 10%，或投诉率达到 0.03%', does: '降低发送量，延长发送间隔' },
  { name: '限流', t: 'watch', when: '垃圾邮件文件夹占比达到 20%', does: '预热和冷邮件发送量减半，恢复后自动解除' },
  { name: '隔离', t: 'bad', when: '投诉率 0.10%、退信率 5%，或反复篡改预热邮件', does: '从付费预热池移除 7 天' },
  { name: '封禁', t: 'bad', when: '投诉率 0.30% 或退信率 10%', does: '封禁 30 天' },
];

/** The four health bands, mildest first. */
export function HealthBands() {
  return (
    <Frame caption="投递位置问题只会降低邮箱发送速度；投诉和退信才会导致移除。">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {HEALTH.map((h, i) => (
          <div key={h.name} className="rounded-lg border border-fd-border bg-fd-background p-3.5">
            <div className="flex items-center justify-between">
              <Pill t={h.t}>{h.name}</Pill>
              <span className="text-[11px] tabular-nums text-fd-muted-foreground">{i + 1} / 4</span>
            </div>
            <Label className="mt-3">触发条件</Label>
            <div className="mt-1 text-[12.5px] leading-[1.45] text-fd-foreground">{h.when}</div>
            <Label className="mt-2.5">处理方式</Label>
            <div className="mt-1 text-[12.5px] leading-[1.45] text-fd-foreground/80">{h.does}</div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/** Free and premium pools stay apart; the one crossing is mirrored. */
export function PoolTiers() {
  return (
    <Frame caption="两个预热池彼此独立。付费邮箱缺少伙伴时，可与经验证的免费邮箱交换邮件，对方也会回信。">
      <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
        <Tier name="付费预热池" t="info" items={['仅包含已预热且符合信誉标准的邮箱', '更严格的隔离阈值']} />
        <div className="flex flex-col items-center justify-center gap-2 px-2 text-center text-[12px] text-fd-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Dir />与经验证的免费邮箱交换邮件</span>
          <span className="inline-flex items-center gap-1.5"><Dir back />对方回信</span>
        </div>
        <Tier name="免费预热池" t="plain" items={['适合测试', '包含风险较高的成员', '不会在未告知的情况下混入付费池']} />
      </div>
    </Frame>
  );
}

function Tier({ name, t, items }: { name: string; t: Tone; items: string[] }) {
  return (
    <div className="rounded-lg border border-fd-border bg-fd-background p-4">
      <Pill t={t}>{name}</Pill>
      <ul className="mt-3 space-y-1.5 text-[12.5px] text-fd-foreground/85">
        {items.map((i) => (
          <li key={i} className="flex gap-2"><span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', fill[t === 'plain' ? 'plain' : t])} />{i}</li>
        ))}
      </ul>
    </div>
  );
}

const RECOVERY: { days: string; warmup: string; cold: string; t: Tone }[] = [
  { days: '第 1 至 7 天', warmup: '仅预热，每日 5 封', cold: '不发送冷邮件', t: 'bad' },
  { days: '第 8 至 14 天', warmup: '每日预热 10 封', cold: '不发送冷邮件', t: 'bad' },
  { days: '第 15 至 28 天', warmup: '每日 15 至 25 封，每天增加 1 封', cold: '向可靠收件人发送少量、语气温和的邮件序列', t: 'watch' },
  { days: '第 29 至 42 天', warmup: '每日 30 至 40 封', cold: '按正常发送额度的一半发送冷邮件', t: 'info' },
  { days: '第 43 天起', warmup: '评估', cold: '收件箱到达率高于 90% 且投诉率低于 0.03%：恢复正常', t: 'good' },
];

/** The recovery ramp, treating the mailbox like a brand-new one. */
export function RecoveryRamp() {
  return (
    <Frame caption="恢复信誉主要靠耐心：经过六周缓慢递增发送量后，邮箱才恢复正常。">
      <ol className="grid gap-2 md:grid-cols-5">
        {RECOVERY.map((r) => (
          <li key={r.days} className="flex flex-col rounded-lg border border-fd-border bg-fd-background p-3">
            <span className={cn('h-1 w-full rounded-full', fill[r.t])} />
            <div className="mt-2.5 text-[13px] font-medium text-fd-foreground">{r.days}</div>
            <div className="mt-1.5 text-[12.5px] text-fd-foreground/85">{r.warmup}</div>
            <div className="mt-1 text-[12px] leading-[1.45] text-fd-muted-foreground">{r.cold}</div>
          </li>
        ))}
      </ol>
    </Frame>
  );
}
