"use client";

import { useEvents } from "@/lib/events-context";
import {
  getEventTitle,
  getEventStartTime,
  getEventLocation,
  getEventUrl,
  getEventImage,
  formatEventTime,
} from "@/lib/events";
import Image from "next/image";
import { X, Clock, MapPin, Calendar, Share2, ExternalLink } from "lucide-react";
import { useEffect } from "react";

export function EventModal() {
  const { selectedEventId, closeEventModal, getEventById, toggleAgenda, isInAgenda } = useEvents();
  
  const event = selectedEventId ? getEventById(selectedEventId) : null;
  const inAgenda = selectedEventId ? isInAgenda(selectedEventId) : false;

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEventModal();
    };
    if (selectedEventId) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [selectedEventId, closeEventModal]);

  if (!selectedEventId || !event) return null;

  const title = getEventTitle(event);
  const time = getEventStartTime(event);
  const location = getEventLocation(event);
  const rsvpUrl = getEventUrl(event);
  const imageUrl = getEventImage(event);
  const description = (event as Record<string, unknown>).description as string || "";

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeEventModal();
  };

  const handleToggleAgenda = () => {
    toggleAgenda(String(event.id));
  };

  const handleShare = async () => {
    const shareText = `${title}\n${formatEventTime(time)}\n${location || "Los Angeles"}${rsvpUrl ? `\n${rsvpUrl}` : ""}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: rsvpUrl || window.location.href });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback to WhatsApp
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
    }
  };

  const handleAddToCalendar = () => {
    const startDate = time ? new Date(time) : new Date();
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours default
    const formatCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const calUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatCalDate(startDate)}/${formatCalDate(endDate)}&location=${encodeURIComponent(location || "")}&details=${encodeURIComponent(description)}`;
    window.open(calUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={handleOverlayClick}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeEventModal}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-white"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-navy" />
        </button>

        {/* Event image */}
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-5">
          <h2 className="font-serif text-2xl font-bold text-navy">{title}</h2>
          
          {description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{description}</p>
          )}

          {/* Event details */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0 text-gold" />
              <span>{formatEventTime(time)}</span>
            </div>
            {location && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-gold"
              >
                <MapPin className="h-4 w-4 shrink-0 text-gold" />
                <span className="underline-offset-2 hover:underline">{location}</span>
              </a>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={handleToggleAgenda}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                inAgenda
                  ? "bg-gold/20 text-gold"
                  : "bg-gold text-navy hover:bg-gold/90"
              }`}
            >
              {inAgenda ? "Added to Agenda" : "Add to Agenda"}
            </button>
            {rsvpUrl && (
              <a
                href={rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-full border border-navy/20 bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
              >
                RSVP <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Secondary actions */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddToCalendar}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <Calendar className="h-4 w-4" />
              Add to Calendar
            </button>
            <button
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
