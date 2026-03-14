"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Calendar, Search, User } from "lucide-react";

type Event = {
  eventId?: number;
  userId: number;
  organizer?: string;
  title: string;
  description?: string;
  date: Date;
  location?: string;
  fee?: string;
  schedules?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  User?: {
    id: number;
    username: string;
    email: string;
  };
};

type EventsForm = {
  title: string;
  description?: string;
  organizer?: string;
  date: Date;
  location?: string;
  fee?: string;
  schedules?: Date;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState<EventsForm>({
    title: "",
    description: "",
    organizer: "",
    date: new Date(),
    location: "",
    fee: "",
    schedules: new Date(),
  });

  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const user = JSON.parse(raw);
      return Number(user?.id) || null;
    } catch {
      return null;
    }
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/events`);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const result = await response.json();
      const eventsData = Array.isArray(result) ? result : result.data || [];
      setEvents(eventsData);
    } catch (e: any) {
      console.error("Fetch error:", e);
      setError(e?.message || "Could not load events try again ");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!currentUserId) {
      setFormError("You must be logged in to create an event.");
      return;
    }
    const { title, description, organizer, date, location, fee, schedules } =
      form;
    if (!title || !date) {
      setFormError("Title and date are required.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId,
          title,
          description,
          organizer,
          date,
          location,
          fee,
          schedules,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to create event.");
      }
      await fetchEvents();
      setForm({
        title: "",
        description: "",
        organizer: "",
        date: new Date(),
        location: "",
        fee: "",
        schedules: new Date(),
      });
    } catch (e: any) {
      console.error("Create event error:", e);
      setFormError(e?.message || "Could not create event try again ");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return events;
    return events.filter((event) =>
      [
        event.title,
        event.description,
        event.organizer,
        event.location,
        event.fee,
        event.User?.username,
        event.date ? new Date(event.date).toLocaleDateString() : "",
        event.schedules ? new Date(event.schedules).toLocaleTimeString() : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(text),
    );
  }, [events, query]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-7 h-7 text-indigo-600" />
                    Events
                  </h1>
                  <div />
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4  text-slate-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search Events, Event details, location..."
                        className="w-150 pl-10 pr-10  py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>
                <div />
              </div>
            </div>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded">
                  {error}
                </div>
              )}
              {loading ? (
                <div className="text-center py-10 text-slate-500">
                  Loading events...
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.eventId}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                    >
                      <h2 className="text-xl font-bold text-slate-900">
                        {event.title}
                      </h2>
                      <p className="text-slate-600">{event.description}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {event.User?.username || "Unknown Organizer"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <p>{new Date(event.date).toLocaleDateString()}</p>
                          <p>{event.schedules && `  ${event.schedules}`}</p>
                          <p>{event.location && ` at ${event.location}`}</p>
                          <p>{event.fee}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  No events found.
                </div>
              )}
            </div>
          </section>
          {/* Right sidebar for creating an event */}
          <aside>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h1>Create an event</h1>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
