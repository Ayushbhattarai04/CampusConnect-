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
    name: string;
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
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        placeholder="Search Events, subject, location..."
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
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
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.eventId}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                    >
                      <h2 className="text-xl font-bold text-slate-900">
                        {event.title}
                      </h2>
                      <p className="text-slate-600">{event.description}</p>
                    </div>
                  ))}
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
