"use client"

import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { useEvents } from "@/lib/events-context"
import { getAgendaEvents, getEventImage, formatEventTime, safeDateValue } from "@/lib/events"

interface WeekDay {
  day: string
  date: string
  fullDate: Date
  events: Array<{
    id: string
    time: string
    title: string
    image: string
  }>
}

function getNextSevenDays(): WeekDay[] {
  const days: WeekDay[] = []
  const now = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(now)
    date.setDate(now.getDate() + i)
    
    days.push({
      day: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: date,
      events: [],
    })
  }
  
  return days
}

export function YourWeek() {
  const { events, loading, setActiveTab, openEventModal, openCategoryPicker } = useEvents()
  const agendaEvents = getAgendaEvents(events)
  
  // Build the week view
  const weekDays = getNextSevenDays()
  
  // Assign agenda events to their respective days
  agendaEvents.forEach((event) => {
    const eventDate = safeDateValue(event.start_time)
    if (!eventDate) return
    
    const dayIndex = weekDays.findIndex((day) => {
      return (
        eventDate.getDate() === day.fullDate.getDate() &&
        eventDate.getMonth() === day.fullDate.getMonth() &&
        eventDate.getFullYear() === day.fullDate.getFullYear()
      )
    })
    
    if (dayIndex !== -1) {
      weekDays[dayIndex].events.push({
        id: String(event.id),
        time: formatEventTime(event.start_time),
        title: event.title || "Event",
        image: getEventImage(event),
      })
    }
  })
  
  // Show first 3 days for compact view
  const displayDays = weekDays.slice(0, 3)

  if (loading) {
    return (
      <section className="px-4 py-4">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-xl font-semibold text-navy">Your Week</h2>
          <button className="flex items-center gap-1 text-sm font-bold text-gold hover:underline">
            View full week
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="h-48 animate-pulse rounded-3xl bg-muted" />
      </section>
    )
  }

  return (
    <section className="px-4 py-4">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-serif text-xl font-semibold text-navy">Your Week</h2>
        <button 
          onClick={() => setActiveTab("agenda")}
          className="flex items-center gap-1 text-sm font-bold text-gold hover:underline"
        >
          View full week
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {displayDays.map((dayData, index) => {
          const hasPlans = dayData.events.length > 0
          const firstEvent = dayData.events[0]
          
          return (
            <div
              key={dayData.day + dayData.date}
              className={`flex items-center gap-3 p-3 ${
                index !== displayDays.length - 1 ? "border-b border-border" : ""
              }`}
            >
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    hasPlans ? "bg-blue" : "border-2 border-muted-foreground/30 bg-transparent"
                  }`}
                />
                {index !== displayDays.length - 1 && (
                  <div className="mt-1 h-10 w-0.5 bg-border" />
                )}
              </div>
              
              {/* Date */}
              <div className="w-14 flex-shrink-0">
                <div className="text-sm font-bold text-navy">{dayData.day}</div>
                <div className="text-xs text-muted-foreground">{dayData.date}</div>
              </div>
              
              {/* Separator */}
              <div className="h-10 w-px bg-border" />
              
              {/* Content */}
              <div className="flex flex-1 items-center justify-between">
                {hasPlans && firstEvent ? (
                  <button
                    onClick={() => openEventModal(firstEvent.id)}
                    className="flex flex-1 items-center justify-between text-left"
                  >
                    <div>
                      <div className="text-sm text-muted-foreground">{firstEvent.time}</div>
                      <div className="font-semibold text-navy">{firstEvent.title}</div>
                      {dayData.events.length > 1 && (
                        <div className="text-xs text-gold">+{dayData.events.length - 1} more</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative h-14 w-20 overflow-hidden rounded-xl">
                        <Image
                          src={firstEvent.image}
                          alt={firstEvent.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </button>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground">No plans yet</span>
                    <button 
                      onClick={() => openCategoryPicker("all")}
                      className="flex items-center gap-1 rounded-xl border border-gold/30 bg-gold/5 px-3 py-2 text-sm font-bold text-gold transition-colors hover:bg-gold/10"
                    >
                      Find {dayData.day.charAt(0) + dayData.day.slice(1).toLowerCase()} plans
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
