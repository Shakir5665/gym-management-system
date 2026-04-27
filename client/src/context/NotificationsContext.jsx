import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { socket } from "../socket";

const NotificationsContext = createContext(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}

function normalizeNotification(n) {
  const now = Date.now();
  return {
    id: n?.id || `${now}-${Math.random().toString(16).slice(2)}`,
    title: n?.title || "Update",
    message: n?.message || "",
    variant: n?.variant || "neutral", // neutral | brand | success | warning | danger
    createdAt: n?.createdAt || now,
    read: Boolean(n?.read),
    meta: n?.meta || {},
  };
}

export function NotificationsProvider({ children }) {
  const [items, setItems] = useState([]);

  const push = useCallback((n) => {
    const notif = normalizeNotification(n);
    setItems((prev) => [notif, ...prev].slice(0, 50));
  }, []);

  const markRead = useCallback((id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  useEffect(() => {
    const onAttendance = (payload) => {
      push({
        title: "Attendance check-in",
        message: payload?.message || "New check-in recorded.",
        variant: "success",
        meta: payload,
      });
    };

    const onGamification = (payload) => {
      push({
        title: "Points updated",
        message: payload?.message || "Gamification stats changed.",
        variant: "brand",
        meta: payload,
      });
    };

    socket.on("attendance:new", onAttendance);
    socket.on("gamification:update", onGamification);

    return () => {
      socket.off("attendance:new", onAttendance);
      socket.off("gamification:update", onGamification);
    };
  }, [push]);

  const unreadCount = useMemo(() => items.reduce((acc, n) => acc + (n.read ? 0 : 1), 0), [items]);

  const value = useMemo(
    () => ({ items, unreadCount, push, markRead, markAllRead, clear }),
    [items, unreadCount, push, markRead, markAllRead, clear],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

