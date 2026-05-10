// Event types and data loading service
// Connects to existing Supabase backend for LA Jewish Tonight events

export interface Event {
  id: string;
  title?: string;
  name?: string;
  summary?: string;
  description?: string;
  start_time?: string;
  start?: string;
  date?: string;
  startDate?: string;
  end_time?: string;
  location?: string;
  venue?: string;
  address?: string;
  image_url?: string;
  image?: string;
  photo?: string;
  thumbnail?: string;
  rsvp_link?: string;
  url?: string;
  link?: string;
  event_url?: string;
  category?: string;
  region?: string;
  organization?: string;
  public_event_url?: string;
  google_event_url?: string;
  google_calendar_url?: string;
  source_url?: string;
}

// Helper to get event title with fallbacks
export function getEventTitle(event: Event | Record<string, unknown>): string {
  const e = event as Record<string, unknown>;
  return String(e.title || e.name || e.summary || "Untitled Event");
}

// Helper to get event start time with fallbacks
export function getEventStartTime(event: Event | Record<string, unknown>): string | undefined {
  const e = event as Record<string, unknown>;
  return String(e.start_time || e.start || e.date || e.startDate || "");
}

// Helper to get event location with fallbacks
export function getEventLocation(event: Event | Record<string, unknown>): string | undefined {
  const e = event as Record<string, unknown>;
  const loc = e.location || e.venue || e.address || e.region;
  return loc ? String(loc) : undefined;
}

// Helper to get event URL with fallbacks
export function getEventUrl(event: Event | Record<string, unknown>): string | undefined {
  const e = event as Record<string, unknown>;
  const url = e.rsvp_link || e.event_url || e.public_event_url || e.url || e.link;
  return url ? String(url) : undefined;
}

const SUPABASE_URL = "https://sigivdodtiewgscokdmk.supabase.co";
const SUPABASE_KEY = "sb_publishable_gK-ytjOr7gd9mygiS2YHQA_qLhtCaCV";

const baseFields =
  "id,title,description,start_time,end_time,location,image_url,rsvp_link,category,region,organization,public_event_url,event_url,google_event_url,google_calendar_url,source_url,url";

const EVENTS_SNAPSHOT_KEY = "lajt_events_snapshot";
const AGENDA_KEY = "lajt_user_agenda";

// Fallback images for events without images
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
];

export function getFallbackImage(category?: string): string {
  const key = String(category || "event");
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
}

export function getEventImage(event: Event | Record<string, unknown>): string {
  // Support common image field names
  const imageUrl = 
    (event as Record<string, unknown>).image_url ||
    (event as Record<string, unknown>).image ||
    (event as Record<string, unknown>).photo ||
    (event as Record<string, unknown>).thumbnail ||
    (event as Record<string, unknown>).imageUrl ||
    (event as Record<string, unknown>).photoUrl ||
    (event as Record<string, unknown>).cover_image ||
    (event as Record<string, unknown>).featured_image;
  
  if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("http")) {
    return imageUrl;
  }
  
  return getFallbackImage((event as Event).category);
}

// Parse date safely
export function safeDateValue(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return d;
  const retry = new Date(String(value).replace(" ", "T"));
  if (!Number.isNaN(retry.getTime())) return retry;
  return null;
}

// Format date for display
export function formatEventDate(dateString: string | null | undefined): string {
  if (!dateString) return "Date TBA";
  const d = safeDateValue(dateString);
  if (!d) return "Date TBA";
  return d.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatEventTime(dateString: string | null | undefined): string {
  if (!dateString) return "Time TBA";
  const d = safeDateValue(dateString);
  if (!d) return "Time TBA";
  return d.toLocaleString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

// Remove duplicate events by ID
function dedupeEvents(events: Event[]): Event[] {
  const seen = new Set<string>();
  return events.filter((e) => {
    const id = String(e.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

// Sort events: future first, then by start time
function sortEventsFutureFirst(events: Event[]): Event[] {
  const now = Date.now();
  return [...events].sort((a, b) => {
    const aTime = safeDateValue(a.start_time)?.getTime() ?? 0;
    const bTime = safeDateValue(b.start_time)?.getTime() ?? 0;
    const aFuture = aTime >= now;
    const bFuture = bTime >= now;
    if (aFuture !== bFuture) return aFuture ? -1 : 1;
    return aTime - bTime;
  });
}

// Local storage helpers
function readEventsSnapshot(): Event[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENTS_SNAPSHOT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEventsSnapshot(events: Event[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVENTS_SNAPSHOT_KEY, JSON.stringify(events.slice(0, 200)));
  } catch {
    // Storage quota exceeded
  }
}

// Agenda (user's saved events) helpers
export function getAgendaEventIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(AGENDA_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

export function addToAgenda(eventId: string): void {
  if (typeof window === "undefined") return;
  const ids = getAgendaEventIds();
  ids.add(eventId);
  localStorage.setItem(AGENDA_KEY, JSON.stringify([...ids]));
}

export function removeFromAgenda(eventId: string): void {
  if (typeof window === "undefined") return;
  const ids = getAgendaEventIds();
  ids.delete(eventId);
  localStorage.setItem(AGENDA_KEY, JSON.stringify([...ids]));
}

export function isInAgenda(eventId: string): boolean {
  return getAgendaEventIds().has(eventId);
}

// Fetch events from Supabase
async function fetchCanonicalEvents(): Promise<Event[]> {
  const now = new Date();
  const sixHoursAgoIso = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();

  const candidates = [
    `published_upcoming_events?select=${encodeURIComponent(baseFields)}&order=start_time.asc&limit=260`,
    `events?select=${encodeURIComponent(baseFields)}&end_time=gte.${encodeURIComponent(sixHoursAgoIso)}&order=start_time.asc&limit=260`,
    `events?select=${encodeURIComponent(baseFields)}&start_time=gte.${encodeURIComponent(sixHoursAgoIso)}&order=start_time.asc&limit=260`,
    `events?select=${encodeURIComponent(baseFields)}&order=start_time.asc&limit=260`,
  ];

  for (const path of candidates) {
    try {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        headers: {
          apikey: SUPABASE_KEY,
          Accept: "application/json",
        },
      });
      if (!resp.ok) continue;
      const rows = await resp.json();
      if (Array.isArray(rows) && rows.length) {
        return rows;
      }
    } catch {
      // Try next candidate
    }
  }
  return [];
}

// Main load function
export async function loadEvents(): Promise<Event[]> {
  // Try cache first for instant display
  const cached = readEventsSnapshot();

  try {
    const canonicalRows = await fetchCanonicalEvents();

    if (canonicalRows.length) {
      const sorted = sortEventsFutureFirst(canonicalRows);
      const deduped = dedupeEvents(sorted);
      saveEventsSnapshot(deduped);
      return deduped;
    }
  } catch {
    // Fall through to cache
  }

  // Return cache if live fetch failed
  if (cached.length) {
    return sortEventsFutureFirst(cached);
  }

  return [];
}

// Category matching helpers for mood cards
const SOCIAL_KEYWORDS = ["social", "fun", "party", "mixer", "movie", "game", "comedy", "happy hour", "networking", "singles"];
const SHABBAT_KEYWORDS = ["shabbat", "friday night", "dinner", "kiddush", "oneg", "shalom"];
const LEARNING_KEYWORDS = ["learning", "class", "lecture", "torah", "rabbi", "parsha", "workshop", "study", "shiur", "education"];
const LOWKEY_KEYWORDS = ["coffee", "brunch", "walk", "meetup", "community", "meditation", "yoga", "wellness", "calm"];

function matchesKeywords(event: Event, keywords: string[]): boolean {
  const text = `${event.title || ""} ${event.description || ""} ${event.category || ""}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

export function countSocialEvents(events: Event[]): number {
  return events.filter((e) => matchesKeywords(e, SOCIAL_KEYWORDS)).length;
}

export function countShabbatEvents(events: Event[]): number {
  return events.filter((e) => matchesKeywords(e, SHABBAT_KEYWORDS)).length;
}

export function countLearningEvents(events: Event[]): number {
  return events.filter((e) => matchesKeywords(e, LEARNING_KEYWORDS)).length;
}

export function countLowkeyEvents(events: Event[]): number {
  return events.filter((e) => matchesKeywords(e, LOWKEY_KEYWORDS)).length;
}

export function countNearbyEvents(events: Event[]): number {
  // Count events that have location data
  return events.filter((e) => e.location || e.region).length;
}

// Get tonight's best event (first upcoming event today or soonest)
export function getTonightsBestMove(events: Event[]): Event | null {
  if (!events.length) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  // First try to find a "tonight" event (today, after current time)
  const tonightEvents = events.filter((e) => {
    const d = safeDateValue(e.start_time);
    if (!d) return false;
    return d >= now && d < todayEnd;
  });

  if (tonightEvents.length) {
    return tonightEvents[0];
  }

  // Otherwise return the soonest upcoming event
  const futureEvents = events.filter((e) => {
    const d = safeDateValue(e.start_time);
    return d && d >= now;
  });

  return futureEvents[0] || events[0];
}

// Get freshly added events (newest by assuming later IDs or recent start times)
export function getFreshlyAddedEvents(events: Event[], limit = 6): Event[] {
  const now = Date.now();
  const twoWeeksOut = now + 14 * 24 * 60 * 60 * 1000;

  // Filter to upcoming events within 2 weeks
  const upcoming = events.filter((e) => {
    const d = safeDateValue(e.start_time);
    if (!d) return false;
    const t = d.getTime();
    return t >= now && t <= twoWeeksOut;
  });

  // Return a mix - prioritize events with images
  const withImages = upcoming.filter((e) => e.image_url);
  const withoutImages = upcoming.filter((e) => !e.image_url);

  return [...withImages.slice(0, limit), ...withoutImages.slice(0, limit - withImages.length)].slice(0, limit);
}

// Get events for "Your Week" based on agenda
export function getAgendaEvents(events: Event[]): Event[] {
  const agendaIds = getAgendaEventIds();
  if (agendaIds.size === 0) return [];

  return events
    .filter((e) => agendaIds.has(String(e.id)))
    .sort((a, b) => {
      const aTime = safeDateValue(a.start_time)?.getTime() ?? 0;
      const bTime = safeDateValue(b.start_time)?.getTime() ?? 0;
      return aTime - bTime;
    });
}

// Generate "Why this works" reasons
export function getWhyThisWorks(event: Event): string[] {
  const reasons: string[] = [];

  const text = `${event.title || ""} ${event.description || ""} ${event.category || ""}`.toLowerCase();

  if (matchesKeywords(event, SOCIAL_KEYWORDS)) reasons.push("social");
  if (text.includes("young") || text.includes("20s") || text.includes("30s")) reasons.push("young crowd");
  if (event.rsvp_link) reasons.push("easy RSVP");
  if (matchesKeywords(event, SHABBAT_KEYWORDS)) reasons.push("Shabbat spirit");
  if (matchesKeywords(event, LEARNING_KEYWORDS)) reasons.push("growth opportunity");
  if (event.location) reasons.push("great location");

  return reasons.slice(0, 3);
}
