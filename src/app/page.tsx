"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, FileText, Sparkles, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/40 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-xl font-bold tracking-tight">Codify</span>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Dashboard
              <ArrowRight className="ml-1 size-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="size-3.5" />
          Your business context, structured
        </div>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Turn what you know into
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            AI that works for you
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
          Answer guided questions about your business. We turn your answers into
          structured reference files that make every AI tool understand your
          brand, offer, and audience.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/interview/soul">
            <Button size="lg" className="gap-2">
              Start Your First Interview
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              View Demo Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <StepCard
              icon={<Brain className="size-6" />}
              step="1"
              title="Answer questions"
              description="We ask you about your business one question at a time. No blank pages, no overwhelm."
            />
            <StepCard
              icon={<FileText className="size-6" />}
              step="2"
              title="We build your reference"
              description="Your answers become structured files — soul, offer, audience, voice — that capture what makes you unique."
            />
            <StepCard
              icon={<BarChart3 className="size-6" />}
              step="3"
              title="AI actually gets you"
              description="Every AI tool reads your reference files. Outputs sound like you, sell what you sell, to the people you serve."
            />
          </div>
        </div>
      </section>

      {/* Social proof placeholder */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <blockquote className="text-xl italic text-muted-foreground">
            &ldquo;The spec IS the hard work now; execution is automated. Once your context is codified, the system runs from your knowledge — not your screen time.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">— The Codify Thesis</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          Codify — Your business context, structured.
        </div>
      </footer>
    </div>
  );
}

function StepCard({ icon, step, title, description }: { icon: React.ReactNode; step: string; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <span className="text-xs font-medium text-muted-foreground">STEP {step}</span>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
