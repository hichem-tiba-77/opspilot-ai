import Link from "next/link";
import type { IconName } from "@/components/Icon";
import { Icon } from "@/components/Icon";

type EmptyStateProps = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  icon?: IconName;
  title: string;
};

export function EmptyState({
  actionHref,
  actionLabel,
  description,
  icon = "activity",
  title,
}: EmptyStateProps) {
  return (
    <section className="panel flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-zinc-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
    </section>
  );
}
