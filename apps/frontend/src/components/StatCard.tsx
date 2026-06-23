import { Icon, type IconName } from "@/components/Icon";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  description: string;
  accent?: "green" | "amber" | "rose" | "cyan";
  icon?: IconName;
};

const accentClasses = {
  green: "metric-accent-green",
  amber: "metric-accent-amber",
  rose: "metric-accent-rose",
  cyan: "metric-accent-cyan",
};

export function StatCard({
  label,
  value,
  description,
  accent = "cyan",
  icon = "activity",
}: StatCardProps) {
  return (
    <div className={cn("panel p-5", accentClasses[accent])}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-bold text-zinc-600">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-white bg-white/80 text-zinc-700 shadow-sm">
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-normal text-zinc-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  );
}
