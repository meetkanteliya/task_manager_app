import Link from "next/link";

type Props = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export default function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: Props) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-12">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-black text-[#2563EB]">
        +
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
