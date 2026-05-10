"use client"

import { Users, Flame, BookOpen, Sofa, MapPin } from "lucide-react"
import { useEvents, type CategoryFilter } from "@/lib/events-context"
import {
  countSocialEvents,
  countShabbatEvents,
  countLearningEvents,
  countLowkeyEvents,
  countNearbyEvents,
} from "@/lib/events"

export function MoodCards() {
  const { events, loading, openCategoryPicker } = useEvents()

  const moods: {
    icon: typeof Users;
    label: string;
    description: string;
    count: number;
    color: string;
    iconBg: string;
    category: CategoryFilter;
  }[] = [
    {
      icon: Users,
      label: "Social",
      description: "Meet new people",
      count: countSocialEvents(events),
      color: "bg-orange-50 text-orange-600",
      iconBg: "bg-orange-100",
      category: "social" as CategoryFilter,
    },
    {
      icon: Flame,
      label: "Shabbat",
      description: "Connect & unwind",
      count: countShabbatEvents(events),
      color: "bg-indigo-50 text-indigo-600",
      iconBg: "bg-indigo-100",
      category: "shabbat" as CategoryFilter,
    },
    {
      icon: BookOpen,
      label: "Learning",
      description: "Grow & discover",
      count: countLearningEvents(events),
      color: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100",
      category: "learning" as CategoryFilter,
    },
    {
      icon: Sofa,
      label: "Low-key",
      description: "Chill & recharge",
      count: countLowkeyEvents(events),
      color: "bg-emerald-50 text-emerald-600",
      iconBg: "bg-emerald-100",
      category: "lowkey" as CategoryFilter,
    },
    {
      icon: MapPin,
      label: "Near me",
      description: "Close to you",
      count: countNearbyEvents(events),
      color: "bg-amber-50 text-amber-600",
      iconBg: "bg-amber-100",
      category: "nearme" as CategoryFilter,
    },
  ]

  return (
    <section className="px-4 py-2">
      <h2 className="mb-4 font-serif text-lg font-semibold text-navy">
        What are you in the mood for?
      </h2>
      
      <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {moods.map((mood) => (
          <button
            key={mood.label}
            onClick={() => openCategoryPicker(mood.category)}
            className="flex min-w-[100px] flex-col items-center rounded-2xl border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-xl ${mood.iconBg}`}>
              <mood.icon className={`h-6 w-6 ${mood.color.split(" ")[1]}`} />
            </div>
            <span className="text-sm font-bold text-navy">{mood.label}</span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              {mood.description}
            </span>
            <span className="mt-1 text-xs font-bold text-gold">
              {loading ? "..." : `${mood.count} events`}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
