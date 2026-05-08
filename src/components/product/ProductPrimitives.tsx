import { ComponentProps, ReactNode } from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-secondary">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "danger";
}) {
  const toneClass = {
    default: "bg-primary/10 text-primary",
    success: "bg-secondary/15 text-secondary",
    danger: "bg-error/10 text-error",
  }[tone];

  return (
    <Card className="border-none shadow-sm transition hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          </div>
          <div className={cn("rounded-lg p-3", toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-4 text-xs font-medium text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}

export function ModuleCard({
  title,
  text,
  icon: Icon,
  children,
}: {
  title: string;
  text: string;
  icon: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{title}</h3>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{text}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title = "Nada por aqui", text }: { title?: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-card p-10 text-center">
      <Inbox className="mx-auto h-10 w-10 text-muted-foreground/40" />
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function QuickAction({ children, className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button className={cn("h-10 rounded-lg font-semibold", className)} {...props}>
      {children}
    </Button>
  );
}
