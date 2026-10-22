import { Arrow, Frame, Label, Pill, fill, type Tone } from './frame';
import { cn } from '@/lib/cn';

// Deliverability and inbox placement: what happens to a message after you send it.

const GATES = [
  { n: 1, name: '接收', by: '收件服务器返回 250', checks: '邮件格式、速率限制、基础 IP 封锁' },
  { n: 2, name: '过滤', by: '垃圾邮件评分', checks: '身份验证、内容、信誉' },
  { n: 3, name: '投递位置', by: '最终归入的文件夹', checks: '收件箱、推广、垃圾邮件，或按规则归档' },
];

export function MailJourney() {
  return (
    <Frame caption="每封邮件都要经过三道关口。投递成功率只反映第一道。">
      <div className="flex min-w-0 flex-col items-stretch md:flex-row md:items-center">
        <div className="rounded-lg border border-fd-border bg-fd-background px-4 py-3 text-center md:w-28">
          <div className="text-[13px] font-medium text-fd-foreground">发送邮件</div>
        </div>
        {GATES.map((g) => (
          <div key={g.n} className="flex flex-col items-stretch md:flex-1 md:flex-row md:items-center">
            <Arrow />
            <div className="flex-1 rounded-lg border border-fd-border bg-fd-background px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-fd-foreground text-[11px] font-medium text-fd-background">{g.n}</span>
                <span className="text-[14px] font-medium text-fd-foreground">{g.name}</span>
              </div>
              <div className="mt-1.5 text-[12.5px] text-fd-muted-foreground">{g.by}</div>
              <div className="mt-0.5 text-[12.5px] text-fd-foreground/80">{g.checks}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 md:ml-[calc(7rem+28px)]">
        <div className="col-span-1 rounded-md border border-dashed border-fd-border px-3 py-2 text-center text-[12px] text-fd-muted-foreground">
          投递成功率在此衡量
        </div>
        <div className="col-span-2 rounded-md border border-dashed border-emerald-300 px-3 py-2 text-center text-[12px] text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-300">
          送达能力取决于后续结果：是否进入收件箱？
        </div>
      </div>
    </Frame>
  );
}

/** 100 sends as dots: accepted almost always, in the inbox far less often. */
export function DeliveryVsPlacement() {
  const dots = Array.from({ length: 100 }, (_, i) => (i < 30 ? 'good' : i < 99 ? 'watch' : 'plain') as Tone);
  return (
    <Frame caption="对于身份验证配置不完善的冷邮件邮箱，投递成功率达 99%、收件箱到达率却只有 30% 的情况并不罕见。">
      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
        <div className="grid w-fit grid-cols-10 gap-1.5">
          {dots.map((t, i) => (
            <span key={i} className={cn('size-3.5 rounded-full', fill[t])} />
          ))}
        </div>
        <div className="space-y-3 text-[13.5px]">
          <Row tone="good" big="30" text="封进入主收件箱" />
          <Row tone="watch" big="69" text="封被接收后，归入垃圾邮件或分类标签页" />
          <Row tone="plain" big="1" text="封被拒收" />
          <div className="border-t border-fd-border pt-3 text-fd-muted-foreground">
            投递成功率为 <b className="font-medium text-fd-foreground">99%</b>。收件箱到达率为 <b className="font-medium text-fd-foreground">30%</b>.
          </div>
        </div>
      </div>
    </Frame>
  );
}

function Row({ tone: t, big, text }: { tone: Tone; big: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn('size-3 shrink-0 rounded-full', fill[t])} />
      <span className="w-7 text-[17px] font-medium tabular-nums text-fd-foreground">{big}</span>
      <span className="text-fd-muted-foreground">{text}</span>
    </div>
  );
}

const BANDS = [
  { from: 0, to: 60, t: 'bad' as Tone, name: '低于 60%', text: '暂停使用此邮箱发送营销活动邮件' },
  { from: 60, to: 80, t: 'watch' as Tone, name: '60% 至 80%', text: '存在问题：检查身份验证、内容及发送量' },
  { from: 80, to: 90, t: 'info' as Tone, name: '80% 至 90%', text: '可以接受，注意后续变化' },
  { from: 90, to: 100, t: 'good' as Tone, name: '高于 90%', text: '邮箱状态健康' },
];

export function PlacementScale() {
  return (
    <Frame caption="收件箱到达率目标。">
      <div className="flex h-3 overflow-hidden rounded-full">
        {BANDS.map((b) => (
          <div key={b.name} className={fill[b.t]} style={{ width: `${b.to - b.from}%` }} />
        ))}
      </div>
      <div className="relative mt-1.5 h-4 text-[11px] tabular-nums text-fd-muted-foreground">
        {[0, 60, 80, 90, 100].map((v) => (
          <span key={v} className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full" style={{ left: `${v}%` }}>
            {v}%
          </span>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {BANDS.map((b) => (
          <div key={b.name} className="rounded-lg border border-fd-border bg-fd-background px-3 py-2.5">
            <Pill t={b.t}>{b.name}</Pill>
            <div className="mt-1.5 text-[12.5px] leading-[1.45] text-fd-foreground/80">{b.text}</div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

const SIGNALS: { name: string; weight: string; w: number; t: Tone }[] = [
  { name: '身份验证', weight: '必需', w: 100, t: 'info' },
  { name: '发件信誉', weight: '高', w: 80, t: 'good' },
  { name: '收件人互动', weight: '高', w: 80, t: 'good' },
  { name: '发送量与行为模式', weight: '高', w: 80, t: 'good' },
  { name: '内容', weight: '中', w: 50, t: 'watch' },
];

export function SignalWeights() {
  return (
    <Frame caption="影响投递位置的因素。权重仅说明大致重要性，服务商并未公开计算公式。">
      <div className="space-y-2.5">
        {SIGNALS.map((s) => (
          <div key={s.name} className="grid grid-cols-[150px_1fr_80px] items-center gap-3 text-[13px] max-sm:grid-cols-[110px_1fr_70px]">
            <span className="text-fd-foreground">{s.name}</span>
            <span className="h-2 rounded-full bg-fd-muted">
              <span className={cn('block h-2 rounded-full', fill[s.t])} style={{ width: `${s.w}%` }} />
            </span>
            <span className="text-right text-fd-muted-foreground">{s.weight}</span>
          </div>
        ))}
      </div>
      <Label className="mt-4">身份验证是必要条件，其余因素综合评估</Label>
    </Frame>
  );
}
