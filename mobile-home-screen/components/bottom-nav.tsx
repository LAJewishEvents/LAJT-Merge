"use client"

import { Moon, Calendar, Compass, User } from "lucide-react"
import { useEvents, type ActiveTab } from "@/lib/events-context"

const tabs: { icon: typeof Moon; label: string; tab: ActiveTab }[] = [
  { icon: Moon, label: "Tonight", tab: "tonight" },
  { icon: Calendar, label: "My Week", tab: "agenda" },
  { icon: Compass, label: "Discover", tab: "discover" },
  { icon: User, label: "Profile", tab: "profile" },
]

export function BottomNav() {
  const { activeTab, setActiveTab } = useEvents()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-[#f8f2e8]/98 backdrop-blur-lg">
      <div className="mx-auto max-w-md">
        <div className="grid grid-cols-4 gap-1 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2">
          {tabs.map((tabItem) => {
            const isActive = activeTab === tabItem.tab
            return (
              <button
                key={tabItem.label}
                onClick={() => setActiveTab(tabItem.tab)}
                className={`flex flex-col items-center gap-1 py-1 ${
                  isActive ? "text-navy" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                    isActive
                      ? "border-navy bg-navy text-white"
                      : "border-border bg-card text-muted-foreground shadow-sm"
                  }`}
                >
                  <tabItem.icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold">{tabItem.label}</span>
                {isActive && (
                  <div className="absolute -bottom-0.5 h-0.5 w-8 rounded-full bg-navy" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
