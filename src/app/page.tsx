import Link from 'next/link';
import { BarChart3, CheckCircle2, Kanban, Shield, Sparkles, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeroPreview, PreviewCard } from '@/components/marketing/hero-preview';

type IconType = React.ComponentType<{ className?: string }>;

function Feature({ icon: Icon, title, description }: { icon: IconType; title: string; description: string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
              <span className="font-semibold">TF</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">TaskFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-[1200px] px-4 pb-10 pt-12 md:pb-16 md:pt-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="subtle" className="rounded-full px-3 py-1">
                Minimal • Developer-first • Fast
              </Badge>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                A clean task system that feels like a real SaaS product.
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
                TaskFlow keeps your workspace sharp: clear hierarchy, calm visuals, and subtle motion—designed for
                builders who care about focus.
              </p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button asChild className="h-11 px-6">
                  <Link href="/dashboard">Launch dashboard</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 px-6">
                  <Link href="/dashboard">See demo workspace</Link>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Accessible contrast
                </span>
                <span className="inline-flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Production-ready structure
                </span>
                <span className="inline-flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Subtle motion only
                </span>
              </div>
            </div>

            <HeroPreview />
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-[1200px] px-4 py-12 md:py-16">
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Built for real workflows</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                  Minimal UI, maximum clarity.
                </h2>
              </div>
              <Badge variant="subtle" className="hidden md:inline-flex">
                Inspired by modern tools, not copied
              </Badge>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Feature
                icon={Kanban}
                title="Flexible task model"
                description="Priorities, statuses, subtasks, and progress—without overcomplication."
              />
              <Feature
                icon={Sparkles}
                title="Clean hierarchy"
                description="Clear typography and spacing to keep your attention on the work, not UI noise."
              />
              <Feature
                icon={BarChart3}
                title="Ready for scale"
                description="A layout and component structure that won’t collapse as features grow."
              />
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-[1200px] px-4 py-12 md:py-16">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Dashboard preview</div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">A calm, developer-grade workspace.</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Sticky header, responsive navigation, polished task cards, and keyboard-friendly interactions—designed
                  to feel like a real product.
                </p>
                <div className="mt-6 flex gap-2">
                  <Button asChild variant="secondary">
                    <Link href="/dashboard">Open dashboard</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Explore tasks</Link>
                  </Button>
                </div>
              </div>
              <PreviewCard className="lg:translate-y-0" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TaskFlow. Minimal task management UI.
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/dashboard/settings" className="hover:text-foreground">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}