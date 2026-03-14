"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Calendar, Search, User, EllipsisVertical } from "lucide-react";

type Event = {
  eventId?: number;
  userId: number;
  organizer?: string;
  title: string;
  description?: string;
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
  createdAt: Date;
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
  const [showMyEventsOnly, setShowMyEventsOnly] = useState(false);

  const [form, setForm] = useState<EventsForm>({
    title: "",
    description: "",
    organizer: "",
    createdAt: new Date(),
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
    const { title, description, organizer, location, fee, schedules } = form;
    if (!title || !schedules) {
      setFormError("Title and event schedule are required.");
      return;
    }
    const publishedDate = new Date();
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
          createdAt: publishedDate,
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
        createdAt: new Date(),
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
        event.createdAt ? new Date(event.createdAt).toLocaleDateString() : "",
        event.schedules ? new Date(event.schedules).toLocaleTimeString() : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(text),
    );
  }, [events, query]);

  const filtereventsByCurrentUser = useMemo(() => {
    if (!currentUserId) return [];
    return events.filter((event) => event.userId === currentUserId);
  }, [events, currentUserId]);

  const toDateTimeLocalValue = (value?: Date) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  //dropdown menu
  const [openDropdownEvents, setOpenDropdownEvents] = useState<
    number | string | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = (eventId: number | string) => {
    setOpenDropdownEvents(openDropdownEvents === eventId ? null : eventId);
  };

  // close dorp down menu when click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownEvents(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside as EventListener);
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventListener,
      );
    };
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
                  <p>
                    <button
                      onClick={() => setShowMyEventsOnly((prev) => !prev)}
                      className={`px-3 py-1 ml-153  rounded-lg text-sm font-medium transition-colors ${
                        showMyEventsOnly
                          ? "bg-indigo-500 text-white "
                          : "bg-indigo-800 text-white "
                      }`}
                    >
                      {showMyEventsOnly
                        ? "Show all events"
                        : "Show my events only"}
                    </button>
                  </p>
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

            {/* EVENTS CARD  */}
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
              ) : (showMyEventsOnly
                  ? filtereventsByCurrentUser
                  : filteredEvents
                ).length > 0 ? (
                <div className="space-y-4">
                  {(showMyEventsOnly
                    ? filtereventsByCurrentUser
                    : filteredEvents
                  ).map((event, index) => {
                    const eventKey =
                      event.eventId ??
                      `${event.userId}-${event.title}-${event.createdAt ?? index}`;

                    return (
                      <div
                        key={eventKey}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
                      >
                        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                          {event.title}
                        </h2>
                        <div className="ml-auto">
                          <button
                            onClick={() => toggleDropdown(eventKey)}
                            className="text-gray-500 ml-180 hover:text-gray-700 hover:transition-colors"
                          >
                            <EllipsisVertical size={24} />
                          </button>
                          {openDropdownEvents === eventKey && (
                            <div
                              ref={dropdownRef}
                              className="absolute ml-150 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10"
                            >
                              <button className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Edit</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Delete</button>
                            </div>
                          )}
                        </div>
                        <p className="">
                          {event.User?.username || "Publisher not found"}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {event.description || "No description provided."}
                        </p>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <User className="w-4 h-4 text-indigo-600" />
                            <span className="font-medium text-slate-700">
                              {event.organizer || event.User?.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                            <span className="font-medium text-slate-700">
                              Event on:{" "}
                              {event.schedules
                                ? new Date(event.schedules).toLocaleString()
                                : "No schedule set"}
                            </span>
                          </div>
                          {(event.location || event.fee) && (
                            <div className="sm:col-span-2 flex flex-wrap items-center gap-2 text-xs">
                              {event.location && (
                                <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-slate-700">
                                  Location: {event.location}
                                </span>
                              )}
                              {event.fee && (
                                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-indigo-700">
                                  Fee: {event.fee}
                                </span>
                              )}
                            </div>
                          )}
                          {event.schedules && (
                            <p className="sm:col-span-2 text-xs text-slate-500">
                              Published on:{" "}
                              {event.createdAt
                                ? new Date(event.createdAt).toLocaleString()
                                : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  No events found.
                </div>
              )}
            </div>
          </section>
          {/* Right side for creating an event */}
          <aside className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Create an event
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Publish date is set automatically when you post.
              </p>

              <form onSubmit={handleCreateEvent} className="mt-4 space-y-3">
                {formError && (
                  <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg text-sm">
                    {formError}
                  </div>
                )}

                <input
                  name="title"
                  value={form.title}
                  onChange={handleInput}
                  placeholder="Event title"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />

                <input
                  name="organizer"
                  value={form.organizer}
                  onChange={handleInput}
                  placeholder="Organizer name"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInput}
                  placeholder="Event description"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />

                <input
                  name="location"
                  value={form.location}
                  onChange={handleInput}
                  placeholder="Location"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  name="fee"
                  value={form.fee}
                  onChange={handleInput}
                  placeholder="Fee (optional)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="space-y-1">
                  <label
                    htmlFor="event-schedule"
                    className="text-sm font-medium text-slate-700"
                  >
                    Event held on
                  </label>
                  <input
                    id="event-schedule"
                    type="datetime-local"
                    value={toDateTimeLocalValue(form.schedules)}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        schedules: e.target.value
                          ? new Date(e.target.value)
                          : undefined,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
                >
                  {submitting ? "Creating..." : "Create Event"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
