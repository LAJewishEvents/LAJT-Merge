"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  type Event,
  loadEvents,
  getAgendaEventIds,
  addToAgenda as addToAgendaStorage,
  removeFromAgenda as removeFromAgendaStorage,
} from "@/lib/events";

export type ActiveTab = "tonight" | "agenda" | "discover" | "profile";
export type CategoryFilter = "all" | "social" | "shabbat" | "learning" | "lowkey" | "nearme";

interface EventsContextValue {
  events: Event[];
  loading: boolean;
  error: string | null;
  agendaIds: Set<string>;
  addToAgenda: (eventId: string) => void;
  removeFromAgenda: (eventId: string) => void;
  toggleAgenda: (eventId: string) => void;
  isInAgenda: (eventId: string) => boolean;
  refresh: () => Promise<void>;
  // Modal
  selectedEventId: string | null;
  openEventModal: (eventId: string) => void;
  closeEventModal: () => void;
  getEventById: (eventId: string) => Event | undefined;
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  // Category filter
  categoryFilter: CategoryFilter;
  setCategoryFilter: (filter: CategoryFilter) => void;
  openCategoryPicker: (category: CategoryFilter) => void;
}

const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agendaIds, setAgendaIds] = useState<Set<string>>(new Set());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("tonight");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadEvents();
      setEvents(data);
      if (data.length === 0) {
        setError("No events found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load events on mount
  useEffect(() => {
    refresh();
    // Load agenda from localStorage
    setAgendaIds(getAgendaEventIds());
  }, [refresh]);

  const addToAgenda = useCallback((eventId: string) => {
    addToAgendaStorage(eventId);
    setAgendaIds((prev) => new Set([...prev, eventId]));
  }, []);

  const removeFromAgenda = useCallback((eventId: string) => {
    removeFromAgendaStorage(eventId);
    setAgendaIds((prev) => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });
  }, []);

  const isInAgenda = useCallback(
    (eventId: string) => {
      return agendaIds.has(eventId);
    },
    [agendaIds]
  );

  const toggleAgenda = useCallback((eventId: string) => {
    if (agendaIds.has(eventId)) {
      removeFromAgendaStorage(eventId);
      setAgendaIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    } else {
      addToAgendaStorage(eventId);
      setAgendaIds((prev) => new Set([...prev, eventId]));
    }
  }, [agendaIds]);

  const openEventModal = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
  }, []);

  const closeEventModal = useCallback(() => {
    setSelectedEventId(null);
  }, []);

  const getEventById = useCallback((eventId: string) => {
    return events.find(e => String(e.id) === String(eventId));
  }, [events]);

  const openCategoryPicker = useCallback((category: CategoryFilter) => {
    setCategoryFilter(category);
    setActiveTab("discover");
  }, []);

  return (
    <EventsContext.Provider
      value={{
        events,
        loading,
        error,
        agendaIds,
        addToAgenda,
        removeFromAgenda,
        toggleAgenda,
        isInAgenda,
        refresh,
        selectedEventId,
        openEventModal,
        closeEventModal,
        getEventById,
        activeTab,
        setActiveTab,
        categoryFilter,
        setCategoryFilter,
        openCategoryPicker,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
}
