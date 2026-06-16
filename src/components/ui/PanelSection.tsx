import type { PropsWithChildren, ReactNode } from "react";

interface PanelSectionProps extends PropsWithChildren {
  title: string;
  action?: ReactNode;
}

export const PanelSection = ({ title, action, children }: PanelSectionProps) => (
  <section className="border-b border-line px-4 py-4 last:border-b-0">
    <div className="mb-3 flex min-h-8 items-center justify-between gap-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {title}
      </h2>
      {action}
    </div>
    <div className="space-y-3">{children}</div>
  </section>
);
