"use client"

import { Menu } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#103252] px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg 
            viewBox="0 0 40 40" 
            className="h-8 w-8 text-gold"
            fill="currentColor"
          >
            <polygon points="20,2 38,32 2,32" fill="none" stroke="currentColor" strokeWidth="2"/>
            <polygon points="20,38 2,8 38,8" fill="none" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="text-xs font-bold tracking-[0.12em] uppercase text-gold">
            LA Jewish Tonight
          </span>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
