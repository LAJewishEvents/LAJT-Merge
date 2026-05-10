"use client"

import { ChevronRight, Star, MapPin, Check, Plus } from "lucide-react"
import Image from "next/image"
import { useEvents } from "@/lib/events-context"
import {
  getFreshlyAddedEvents,
  getEventImage,
  formatEventDate,
  safeDateValue,
} from "@/lib/events"

function getRelativeDay(dateString: string | null | undefined): string {
  if (!dateString) return "Soon"
  const d = safeDateValue(dateString)
  if (!d) return "Soon"

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = (eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)

  if (diff < 0) return "Past"
  if (diff === 0) {
    // Check if it's tonight (after 5pm) or today
    const hour = d.getHours()
    return hour >= 17 ? "Tonight" : "Today"
  }
  if (diff === 1) return "Tomorrow"
  return d.toLocaleDateString("en-US", { weekday: "short" })
}

function getEventTime(dateString: string | null | undefined): string {
  if (!dateString) return "TBA"
  const d = safeDateValue(dateString)
  if (!d) return "TBA"
  return d.toLocaleString([], { hour: "numeric", minute: "2-digit" })
}

export function FreshlyAdded() {
  const { events, loading, toggleAgenda, isInAgenda, openEventModal, setActiveTab } = useEvents()
  const freshEvents = getFreshlyAddedEvents(events, 6)

  if (loading) {
    return (
      <section className="px-4 py-4 pb-28">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-xl font-semibold text-navy">
            Freshly added
          </h2>
          <button className="flex items-center gap-1 text-sm font-bold text-gold hover:underline">
            See all
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 w-36 flex-shrink-0 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </section>
    )
  }

  if (freshEvents.length === 0) {
    return (
      <section className="px-4 py-4 pb-28">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-xl font-semibold text-navy">
            Freshly added
          </h2>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-muted-foreground">Check back soon for new events!</p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-4 pb-28">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-serif text-xl font-semibold text-navy">
          Freshly added
        </h2>
        <button 
          onClick={() => setActiveTab("discover")}
          className="flex items-center gap-1 text-sm font-bold text-gold hover:underline"
        >
          See all
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {freshEvents.map((event) => {
          const eventId = String(event.id)
          const inAgenda = isInAgenda(eventId)
          
          const handleBookmark = (e: React.MouseEvent) => {
            e.stopPropagation()
            toggleAgenda(eventId)
          }
          
          const handleCardClick = () => {
            openEventModal(eventId)
          }
          
          return (
            <button
              key={event.id}
              onClick={handleCardClick}
              className="relative min-w-[140px] max-w-[140px] flex-shrink-0 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              {/* Bookmark button */}
              <button
                onClick={handleBookmark}
                className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-colors ${
                  inAgenda
                    ? "bg-green-500 text-white"
                    : "bg-white/90 text-gold"
                }`}
              >
                {inAgenda ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
              </button>
              
              {/* Image */}
              <div className="relative h-24 w-full">
                <Image
                  src={getEventImage(event)}
                  alt={event.title || "Event"}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="p-2.5">
                <h3 className="line-clamp-2 text-sm font-bold leading-tight text-navy">
                  {event.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getRelativeDay(event.start_time)} · {getEventTime(event.start_time)}
                </p>
                {(event.location || event.region) && (
                  <p className="mt-0.5 flex items-center gap-0.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {event.region || event.location?.split(",")[0]}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
