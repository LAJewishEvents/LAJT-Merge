"use client"

import { Star, Clock, MapPin, Plus, ChevronRight, Check } from "lucide-react"
import Image from "next/image"
import { useEvents } from "@/lib/events-context"
import {
  getTonightsBestMove,
  getEventImage,
  getEventTitle,
  getEventStartTime,
  getEventLocation,
  getEventUrl,
  formatEventTime,
  getWhyThisWorks,
} from "@/lib/events"

export function TonightsBestMove() {
  const { events, loading, toggleAgenda, isInAgenda, openEventModal } = useEvents()
  const bestMove = getTonightsBestMove(events)
  
  if (loading) {
    return (
      <section className="px-4 py-5">
        <div className="mb-4 flex items-center gap-2">
          <Star className="h-4 w-4 fill-gold text-gold" />
          <h2 className="font-serif text-xl font-semibold text-navy">
            Tonight&apos;s best move
          </h2>
        </div>
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
      </section>
    )
  }
  
  if (!bestMove) {
    return (
      <section className="px-4 py-5">
        <div className="mb-4 flex items-center gap-2">
          <Star className="h-4 w-4 fill-gold text-gold" />
          <h2 className="font-serif text-xl font-semibold text-navy">
            Tonight&apos;s best move
          </h2>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-muted-foreground">No events available right now.</p>
        </div>
      </section>
    )
  }

  const inAgenda = isInAgenda(String(bestMove.id))
  const whyThisWorks = getWhyThisWorks(bestMove)
  const eventTitle = getEventTitle(bestMove)
  const eventTime = getEventStartTime(bestMove)
  const eventLocation = getEventLocation(bestMove)
  const rsvpUrl = getEventUrl(bestMove)

  const handleAgendaToggle = () => {
    toggleAgenda(String(bestMove.id))
  }

  const handleDetails = () => {
    openEventModal(String(bestMove.id))
  }

  return (
    <section className="px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Star className="h-4 w-4 fill-gold text-gold" />
        <h2 className="font-serif text-xl font-semibold text-navy">
          Tonight&apos;s best move
        </h2>
      </div>
      
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
        <div className="flex flex-col sm:flex-row sm:min-h-[280px]">
          <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-2/5">
            <Image
              src={getEventImage(bestMove)}
              alt={eventTitle}
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                <span className="text-xs font-bold uppercase tracking-wide text-gold">
                  Top Pick
                </span>
              </div>
              
              <h3 className="font-serif text-xl font-bold leading-tight text-navy">
                {eventTitle}
              </h3>
              
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 shrink-0" />
                  {formatEventTime(eventTime)}
                </span>
                {eventLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{eventLocation.split(",")[0]}</span>
                  </span>
                )}
              </div>
              
              {whyThisWorks.length > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Why this works:</span>{" "}
                  {whyThisWorks.join(" · ")}
                </p>
              )}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleAgendaToggle}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                  inAgenda
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-navy text-white hover:bg-navy/90"
                }`}
              >
                {inAgenda ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add to My Week
                  </>
                )}
              </button>
              <button
                onClick={handleDetails}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-muted"
              >
                Details
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
