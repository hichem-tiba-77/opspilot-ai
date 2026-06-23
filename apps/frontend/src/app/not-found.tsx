import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <main className="app-surface flex min-h-[calc(100vh-73px)] items-center justify-center px-4 text-zinc-950">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-zinc-950 text-white">
          <Icon name="alert" className="h-6 w-6" />
        </div>
        <p className="mt-6 text-sm font-black uppercase tracking-[0.08em] text-zinc-500">
          404
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-normal">
          Page not found
        </h1>
        <p className="mt-3 leading-7 text-zinc-600">
          The page you&apos;re looking for does not exist or has moved.
        </p>
        <Link href="/dashboard" className="btn-primary mt-8">
          Go to dashboard
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
