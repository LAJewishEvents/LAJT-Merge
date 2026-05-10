"use client"

import { Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="bg-[#103252] px-4 pb-6 pt-2">
      <h1 className="font-serif text-[2.5rem] font-bold leading-[0.95] tracking-tight text-white">
        Personal LA Jewish Agenda{" "}
        <span className="ml-1 inline-flex items-center justify-center rounded-full border border-gold/40 px-2 py-0.5 align-middle text-xs font-bold text-gold">
          V2
        </span>
      </h1>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-white/70">
        <Sparkles className="h-4 w-4 text-gold" />
        Updated daily from LA Jewish community calendars.
      </p>
    </section>
  )
}
