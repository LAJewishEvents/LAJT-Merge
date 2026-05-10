"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TonightsBestMove } from "@/components/tonights-best-move"
import { MoodCards } from "@/components/mood-cards"
import { YourWeek } from "@/components/your-week"
import { FreshlyAdded } from "@/components/freshly-added"
import { BottomNav } from "@/components/bottom-nav"
import { EventModal } from "@/components/event-modal"
import { EventsProvider, useEvents } from "@/lib/events-context"

function HomeContent() {
  const { activeTab } = useEvents()
  
  // Tonight tab - the main home view
  if (activeTab === "tonight") {
    return (
      <>
        <Header />
        <HeroSection />
        
        <main className="rounded-t-[2rem] bg-background -mt-1">
          <TonightsBestMove />
          <MoodCards />
          <YourWeek />
          <FreshlyAdded />
        </main>
      </>
    )
  }
  
  // My Week / Agenda tab
  if (activeTab === "agenda") {
    return (
      <>
        <Header />
        <main className="px-4 py-6 pb-28">
          <h1 className="font-serif text-2xl font-bold text-navy">My Week</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your saved events and agenda. Add events from the Tonight or Discover tabs.
          </p>
          <div className="mt-6">
            <YourWeek />
          </div>
        </main>
      </>
    )
  }
  
  // Discover tab
  if (activeTab === "discover") {
    return (
      <>
        <Header />
        <main className="px-4 py-6 pb-28">
          <h1 className="font-serif text-2xl font-bold text-navy">Discover</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Find events by category or browse all upcoming events.
          </p>
          <div className="mt-4">
            <MoodCards />
          </div>
          <div className="mt-4">
            <FreshlyAdded />
          </div>
        </main>
      </>
    )
  }
  
  // Profile tab
  if (activeTab === "profile") {
    return (
      <>
        <Header />
        <main className="px-4 py-6 pb-28">
          <h1 className="font-serif text-2xl font-bold text-navy">Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your account and preferences.
          </p>
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <p className="text-muted-foreground">Profile settings coming soon!</p>
          </div>
        </main>
      </>
    )
  }
  
  return null
}

export default function HomePage() {
  return (
    <EventsProvider>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-md">
          <HomeContent />
        </div>
        
        <BottomNav />
        <EventModal />
      </div>
    </EventsProvider>
  )
}
