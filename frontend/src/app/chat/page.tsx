"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";



type User = {
  id: number;
  name: string;
  status: "Online" | "Offline";
};

type Message = {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
  fromUserId?: number;
  toUserId?: number;
};

type ApiUser = {
  id: number;
  username?: string;
  email?: string;
};

type SocketMessage = {
  id: string;
  text: string;
  fromUserId: number;
  toUserId: number;
  time: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const timeNow = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** Decode a JWT payload without any library */
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Get the logged-in user's ID from the JWT stored in localStorage */
function getMyUserIdFromStorage(): number | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = decodeJwt(token);
    // Common JWT claims for user id: "id", "userId", "sub"
    const id = (payload?.id ?? payload?.userId ?? payload?.sub) as
      | number
      | string
      | undefined;
    return id !== undefined ? Number(id) : null;
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Chat() {
  const [msg, setMsg] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messagesByUser, setMessagesByUser] = useState<
    Record<number, Message[]>
  >({});
  const [search, setSearch] = useState("");

  // Read myUserId once from localStorage on mount — stored in a ref so it
  // never triggers re-renders and is always available synchronously
  const myUserId = useRef<number | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const messages: Message[] = selectedUserId
    ? (messagesByUser[selectedUserId] ?? [])
    : [];

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase())),
    [users, search],
  );

  // ── Socket + auth setup (runs once on mount) ───────────────────────────────

  useEffect(() => {
    // Resolve the logged-in user's ID from localStorage before anything else
    myUserId.current = getMyUserIdFromStorage();

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // Register with the server so it knows which user this socket belongs to
      if (myUserId.current !== null) {
        socket.emit("register", { userId: myUserId.current });
      }
    });

    socket.on("receiveMessage", (payload: SocketMessage) => {
      const incoming: Message = {
        id: payload.id,
        text: payload.text,
        sender: "them",
        time: payload.time,
        fromUserId: payload.fromUserId,
        toUserId: payload.toUserId,
      };

      setMessagesByUser((prev) => {
        const threadKey = payload.fromUserId;
        const current = prev[threadKey] ?? [];
        return { ...prev, [threadKey]: [...current, incoming] };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Fetch users ────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError("");
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/auth/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok)
          throw new Error(`Failed to load users (${response.status})`);

        const result = await response.json();
        const data: ApiUser[] = Array.isArray(result) ? result : result.data;

        const mappedUsers: User[] = (data || []).map((user) => ({
          id: user.id,
          name: user.username || user.email?.split("@")[0] || "User",
          status: "Online",
        }));

        setUsers(mappedUsers);

        // Auto-select the first user that isn't the logged-in user
        if (selectedUserId === null) {
          const firstOther = mappedUsers.find((u) => u.id !== myUserId.current);
          if (firstOther) setSelectedUserId(firstOther.id);
        }
      } catch (error: unknown) {
        setUsersError(
          error instanceof Error ? error.message : "Unable to load users",
        );
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-scroll ────────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ───────────────────────────────────────────────────────────────────

  const send = () => {
    const trimmed = msg.trim();
    if (!trimmed || !selectedUserId || myUserId.current === null) return;

    const payload: SocketMessage = {
      id: generateId(),
      text: trimmed,
      fromUserId: myUserId.current,
      toUserId: selectedUserId,
      time: timeNow(),
    };

    const outgoing: Message = { ...payload, sender: "me" };

    setMessagesByUser((prev) => {
      const current = prev[selectedUserId] ?? [];
      return { ...prev, [selectedUserId]: [...current, outgoing] };
    });

    socketRef.current?.emit("sendMessage", payload);
    setMsg("");
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-10xl px-4 sm:px-6 py-10 mx-auto">
        <div className="flex gap-10">
          {/* ── Sidebar ── */}
          <aside className="w-64 shrink-0 rounded-2xl border border-slate-200 bg-white shadow-sm p-4 h-fit">
            <h2
              className="text-sm font-semibold text-slate-900"
              style={{ fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}
            >
              Users
            </h2>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full mt-3 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />

            <div className="mt-3 space-y-2">
              {usersLoading ? (
                <p className="text-xs text-slate-500">Loading users…</p>
              ) : usersError ? (
                <p className="text-xs text-red-600">{usersError}</p>
              ) : filteredUsers.filter((u) => u.id !== myUserId.current)
                  .length === 0 ? (
                <p className="text-xs text-slate-500">No users found.</p>
              ) : (
                filteredUsers
                  .filter((u) => u.id !== myUserId.current) // hide yourself
                  .map((user) => {
                    const unread = (messagesByUser[user.id] ?? []).filter(
                      (m) => m.sender === "them",
                    ).length;
                    return (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                          user.id === selectedUserId
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.name}
                          </p>
                          <p
                            className={`text-xs ${
                              user.id === selectedUserId
                                ? "text-white/70"
                                : "text-slate-500"
                            }`}
                          >
                            {user.status}
                          </p>
                        </div>
                        {unread > 0 && user.id !== selectedUserId && (
                          <span className="ml-auto shrink-0 rounded-full bg-slate-900 text-white text-[10px] px-1.5 py-0.5 font-bold">
                            {unread}
                          </span>
                        )}
                      </button>
                    );
                  })
              )}
            </div>
          </aside>

          {/* ── Chat panel ── */}
          <section className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-[70vh]">
            <header className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <div>
                <h1
                  className="text-lg font-semibold text-slate-900"
                  style={{
                    fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
                  }}
                >
                  {selectedUser?.name ?? "Select a user"}
                </h1>
                <p className="text-xs text-slate-500">
                  {selectedUser?.status ?? ""}
                </p>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 px-6 py-5 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {selectedUserId
                    ? "No messages yet. Say hello!"
                    : "Select a user to start chatting."}
                </p>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "me"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          message.sender === "me"
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className="mt-1 text-[10px] opacity-70">
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Type a message…"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <button
                  className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 disabled:bg-slate-400 transition"
                  onClick={send}
                  disabled={!msg.trim() || !selectedUserId}
                >
                  Send
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
