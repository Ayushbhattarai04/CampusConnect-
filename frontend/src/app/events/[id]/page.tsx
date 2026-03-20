// app/events/[id]/page.tsx
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
} from "lucide-react";

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get current user from localStorage (same pattern as your events page)
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
        console.log("Event API response:", JSON.stringify(data, null, 2)); // 👈 add this
        setEvent(data.data ?? data);
      } catch (e: any) {
        setError(e?.message || "Could not load event.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
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

  type RegisterElements = {
    registeredname: string;
    registeredemail: string;
    numberoftickets: number;
  };
  //Create a event registration
  const handleRegister = async () => {
    if (!event?.eventId) return;
    try {
      const res = await fetch(`${API_BASE}/api/event-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId: event.eventId, ...registerElements }),
      });
      if (!res.ok) throw new Error("Failed to register for event.");
      alert("Successfully registered for the event!");
    } catch (e: any) {
      alert(e?.message || "Could not register for event.");
    }
  };

  const [registerElements, setRegisterElements] = useState<RegisterElements>({ registeredname: "", registeredemail: "", numberoftickets: 1 });

  //loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading event...</p>
        </div>
      </div>
    );
  }

  //Error
  if (error || !event) {
    return (
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
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-1/2">
        <div className=" mx-auto px-4 sm:px-6 py-10">
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
            <div className="bg-indigo-600 px-6 py-8 relative">
              <p className="text-indigo-200 text-sm mb-1">
                Organized by{" "}
                <span className="font-medium text-indigo-100">
                  {event.organizer || event.User?.username || "Unknown"}
                </span>
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white pr-16">
                {event.title}
              </h1>

              {/*  only visible to the event creator */}
              {isOwner && (
                <div className="absolute top-5 right-5 flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/events/${event.eventId}/edit`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-medium transition-colors"
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
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Event Date</p>
                    <p className="text-sm font-medium text-slate-700">
                      {event.schedules
                        ? new Date(event.schedules).toLocaleString()
                        : "No schedule set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <User className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Posted by</p>
                    <p className="text-sm font-medium text-slate-700">
                      {event.User?.username || "Unknown"}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="text-sm font-medium text-slate-700">
                        {event.location}
                      </p>
                    </div>
                  </div>
                )}

                {event.fee && (
                  <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                    <DollarSign className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-xs text-indigo-400">Entry Fee</p>
                      <p className="text-sm font-medium text-indigo-700">
                        {event.fee}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    About this Event
                  </h2>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                Published on{" "}
                {event.createdAt
                  ? new Date(event.createdAt).toLocaleString()
                  : "Unknown"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w1/2 flex bg-slate-50 items-center">
        {/* <button onClick={()=>(registerElements)}>Want to register?</button> */}


        <input
          className="border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Enter Name to be rgistered in"
          value={registerElements.registeredname}
          onChange={(e) =>
            setRegisterElements({ ...registerElements, registeredname: e.target.value })
          }
        ></input>
        <input
          className="border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Enter your email"
          value={registerElements.registeredemail}
          onChange={(e) =>
            setRegisterElements({ ...registerElements, registeredemail: e.target.value })
          }
        ></input>
        <button
          onClick={handleRegister}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Register

        </button>
      <input
          type="number"
          className="border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ml-4 w-20"
          placeholder="Tickets"
          value={registerElements.numberoftickets}
          onChange={(e) =>
            setRegisterElements({ ...registerElements, numberoftickets: Number(e.target.value) })
          }
        ></input>
      </div>
    </div>
  );
}
