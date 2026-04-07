"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  User,
  ArrowLeft,
  DollarSign,
  Clock,
  Pencil,
  Trash2,
  AlertCircle,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Search,
} from "lucide-react";
import AppShell from "../../pages/AppShell";

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

type RegisterElements = {
  registeredname: string;
  registeredemail: string;
  numberoftickets: number;
};

type EventRegistrationItem = {
  registrationId: number;
  registeredname: string;
  registeredemail: string;
  numberoftickets: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [registrationsSuccess, setRegistrationsSuccess] = useState("");
  const [ownerRegistrationCount, setOwnerRegistrationCount] = useState(0);
  const [ownerRegistrations, setOwnerRegistrations] = useState<
    EventRegistrationItem[]
  >([]);
  const [showOwnerRegistrations, setShowOwnerRegistrations] = useState(false);
  const [ownerRegistrationsLoading, setOwnerRegistrationsLoading] =
    useState(false);
  const [ownerRegistrationsError, setOwnerRegistrationsError] = useState("");
  const [otherEvents, setOtherEvents] = useState<Event[]>([]);

  // Get current user from localStorage
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

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/events/${id}`);
        if (!res.ok) throw new Error(`Event not found (${res.status})`);
        const data = await res.json();
        console.log("Event API response:", JSON.stringify(data, null, 2));
        setEvent(data.data ?? data);
      } catch (e: any) {
        setError(e?.message || "Could not load event.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Other events
  useEffect(() => {
    const fetchOtherEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/events`);
        if (!res.ok) return;
        const data = await res.json();
        const all: Event[] = data.data ?? data;
        setOtherEvents(all.filter((e) => e.eventId !== Number(id)).slice(0, 5));
      } catch {
        error && console.error("Failed to fetch other events:", error);
      }
    };
    fetchOtherEvents();
  }, [id]);

  const handleDelete = async () => {
    if (!event?.eventId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/${event.eventId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete event.");
      router.push("/events");
    } catch (e: any) {
      setError(e?.message || "Could not delete event.");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = currentUserId && event?.userId === currentUserId;

  const fetchRegistrations = async () => {
    if (!event?.eventId) return;
    try {
      setOwnerRegistrationsLoading(true);
      setOwnerRegistrationsError("");
      const res = await fetch(
        `${API_BASE}/api/event-registration?eventId=${event.eventId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch registrations.");
      const data = await res.json();
      setOwnerRegistrations(data?.data ?? []);
      console.log("Registrations API response:", JSON.stringify(data, null, 2));
    } catch (e: any) {
      setOwnerRegistrationsError(e?.message || "Could not load registrations.");
    } finally {
      setOwnerRegistrationsLoading(false);
    }
  };

  const fetchOwnerRegistrationCount = async () => {
    if (!isOwner || !currentUserId) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/event-registration/owner/${currentUserId}/count`,
      );
      if (!res.ok) throw new Error("Failed to fetch registration count.");
      const data = await res.json();
      setOwnerRegistrationCount(Number(data?.data?.totalRegistrations) || 0);
    } catch {
      setOwnerRegistrationCount(0);
    }
  };

  useEffect(() => {
    fetchOwnerRegistrationCount();
  }, [event?.eventId, isOwner, currentUserId]);

  const handleToggleOwnerRegistrations = async () => {
    const nextValue = !showOwnerRegistrations;
    setShowOwnerRegistrations(nextValue);

    if (nextValue && ownerRegistrations.length === 0) {
      await fetchRegistrations();
    }
  };

  //Create a event registration
  const handleRegister = async () => {
    if (!event?.eventId || !currentUserId) {
      setRegistrationError("Please login first to register for this event.");
      return;
    }

    if (
      !registerElements.registeredname?.trim() ||
      !registerElements.registeredemail?.trim() ||
      !registerElements.numberoftickets ||
      registerElements.numberoftickets <= 0
    ) {
      setRegistrationError(
        "All fields are required and number of tickets must be at least 1",
      );
      return;
    }

    setRegistrationError("");

    try {
      const res = await fetch(`${API_BASE}/api/event-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.eventId,
          userId: currentUserId,
          registeredname: registerElements.registeredname,
          registeredemail: registerElements.registeredemail,
          numberoftickets: registerElements.numberoftickets,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(data?.message || "Failed to register for event.");
      setRegistrationsSuccess("Successfully registered for the event!");

      setRegisterElements({
        registeredname: "",
        registeredemail: "",
        numberoftickets: 1,
      });
    } catch (e: any) {
      setRegistrationError(e?.message || "Could not register for event.");
    }
  };

  const [registerElements, setRegisterElements] = useState<RegisterElements>({
    registeredname: "",
    registeredemail: "",
    numberoftickets: 1,
  });

  //Other Events

  //loading
  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading event...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  //Error
  if (error || !event) {
    return (
      <AppShell>
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
          <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-sm text-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-slate-700 font-medium mb-1">
              Something went wrong
            </p>
            <p className="text-sm text-red-500 mb-4">
              {error || "Event not found."}
            </p>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-orange-600 hover:underline mx-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Go back
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    
    <AppShell>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-8xl px-2 sm:px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                GoBack
              </button>

              {/* Delete confirm banner */}
              {showDeleteConfirm && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-sm font-medium">
                      Are you sure you want to delete this event? This cannot be
                      undone.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {deleting ? "Deleting..." : "Yes, delete"}
                    </button>
                  </div>
                </div>
              )}

              {/* Main card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Header banner */}
                <div className="relative bg-slate-700 px-6 py-8">
                  <div />
                  <p className="relative text-slate-200 text-sm mb-1">
                    Organized by{" "}
                    <span className="font-medium text-slate-100">
                      {event.organizer || event.User?.username || "Unknown"}
                    </span>
                  </p>
                  <h1 className="relative text-2xl sm:text-3xl font-bold text-white pr-16">
                    {event.title}
                  </h1>

                  {/*  only visible to the event creator */}
                  {isOwner && (
                    <div className="absolute top-5 right-5 flex items-center gap-2">
                      <button
                        onClick={() =>
                          router.push(`/events/${event.eventId}/edit`)
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm text-white hover:bg-blue-600 text-xs font-medium transition-colors border border-white/20"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-red-500 text-xs font-medium transition-colors border border-white/20 "
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/*Events Details */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Event Date</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {event.schedules
                            ? new Date(event.schedules).toLocaleString()
                            : "No schedule set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Posted by</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {event.User?.username || "Unknown"}
                        </p>
                      </div>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Location</p>
                          <p className="text-sm font-semibold text-slate-700">
                            {event.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {event.fee && (
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <DollarSign className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs">Entry Fee</p>
                          <p className="text-sm font-semibold text-slate-700">
                            {event.fee}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Published on{" "}
                    {event.createdAt
                      ? new Date(event.createdAt).toLocaleString()
                      : "Unknown"}
                  </div>
                </div>
        </div>

        {/* Description */}
        <div className="bg-white mt-6 border border-slate-200 shadow-sm p-6 rounded-2xl">
          {event.description && (
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Event Description
              </h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">
                {event.description}
              </p>
            </div>
          )}
        </div>
        {/* events cretors event registrations lists */}
        <div className="  mx-auto px-4 sm:px-6 py-10">
          {isOwner && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                <button
                  onClick={handleToggleOwnerRegistrations}
                  className="w-full flex items-center justify-between px-2 py-1 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Users className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-lg font-medium text-slate-600">
                      Registrations
                    </span>
                    <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-orange-600 text-white text-xs font-bold">
                      {ownerRegistrationCount}
                    </span>
                  </div>
                  {showOwnerRegistrations ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showOwnerRegistrations && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    {ownerRegistrationsLoading && (
                      <p className="text-sm text-slate-500">
                        Loading registrations...
                      </p>
                    )}

                    {ownerRegistrationsError && (
                      <p className="text-sm text-red-600">
                        {ownerRegistrationsError}
                      </p>
                    )}

                    {!ownerRegistrationsLoading &&
                      !ownerRegistrationsError &&
                      ownerRegistrations.length === 0 && (
                        <p className="text-sm text-slate-500">
                          No registrations yet.
                        </p>
                      )}

                    {!ownerRegistrationsLoading &&
                      !ownerRegistrationsError &&
                      ownerRegistrations.length > 0 && (
                        <div className="space-y-2">
                          {ownerRegistrations.map((registration) => (
                            <div
                              key={registration.registrationId}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                            >
                              <div className="space-y-0.5">
                                <p className="text-sm font-semibold text-slate-700">
                                  {registration.registeredname}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {registration.registeredemail}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-slate-400">
                                  #{registration.registrationId}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                                  {registration.numberoftickets}{" "}
                                  {registration.numberoftickets === 1
                                    ? "ticket"
                                    : "tickets"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <aside className="lg:col-span-1 mt-15 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 px-6 py-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">
              Book Your Ticket
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in your details to register for this event.
            </p>
          </div>

          <div className="p-6 space-y-4">
            {registrationsSuccess && !registrationError && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-sm font-medium text-emerald-700">
                  {registrationsSuccess}
                </p>
              </div>
            )}

            {registrationError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <p className="text-sm text-red-700">{registrationError}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Registered Name
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white transition-all"
                placeholder="Enter name for registration"
                value={registerElements.registeredname}
                onChange={(e) => {
                  setRegisterElements({
                    ...registerElements,
                    registeredname: e.target.value,
                  });
                  setRegistrationError("");
                  setRegistrationsSuccess("");
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white transition-all"
                placeholder="Enter your email"
                value={registerElements.registeredemail}
                onChange={(e) => {
                  setRegisterElements({
                    ...registerElements,
                    registeredemail: e.target.value,
                  });
                  setRegistrationError("");
                  setRegistrationsSuccess("");
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Number of Tickets
              </label>
              <input
                type="number"
                min={1}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white transition-all"
                placeholder="1"
                value={registerElements.numberoftickets}
                onChange={(e) => {
                  setRegisterElements({
                    ...registerElements,
                    numberoftickets: Number(e.target.value),
                  });
                  setRegistrationError("");
                  setRegistrationsSuccess("");
                }}
              />
            </div>

            <button
              onClick={handleRegister}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all shadow-sm shadow-orange-200"
            >
              Register Now
            </button>

            {event.fee && (
              <p className="text-center text-xs text-slate-400">
                Entry fee:{" "}
                <span className="font-semibold text-orange-600">
                  {event.fee}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Other Events */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Other Events
            </h2>
            <Search className="w-5 h-5 text-slate-400 hover:text-black" />
            <input
              className="rounded-2xl p-1 pl-2 pr-15 border-gray-300 border-1 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Search events..."
            />
          </div>
          <div className="p-4 space-y-2">
            {otherEvents.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No other events.
              </p>
            )}
            {otherEvents.map((e) => (
              <div
                key={e.eventId}
                onClick={() => router.push(`/events/${e.eventId}`)}
                className="w-full text-left rounded-xl border border-slate-100 bg-slate-50 hover:bg-orange-50 hover:border-orange-100 px-4 py-3 transition-colors group"
              >
                <p className="text-sm font-semibold text-slate-700 group-hover:text-orange-700 line-clamp-1">
                  {e.title}
                </p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {e.schedules && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(e.schedules).toLocaleDateString()}
                    </span>
                  )}
                  {e.location && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {e.location}
                    </span>
                  )}
                </div>
                {e.fee && (
                  <span className="inline-block mt-2 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                    {e.fee}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
        </div>
        </div>
        </div>
    </AppShell>
  );
}
