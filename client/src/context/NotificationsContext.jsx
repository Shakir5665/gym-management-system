import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { socket } from "../socket";
import API from "../api/api";

const NotificationsContext = createContext(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside NotificationsProvider",
    );
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
    
    // Check if this notification was previously marked as read in localStorage
    const readIds = JSON.parse(localStorage.getItem("readNotifications") || "[]");
    if (readIds.includes(notif.id)) {
      notif.read = true;
    }

    setItems((prev) => {
      const exists = prev.find((item) => item.id === notif.id);
      if (exists) {
        // If it exists but its read status has changed in state, we keep the state version
        return prev;
      }
      return [notif, ...prev].slice(0, 50);
    });
  }, []);

  const markRead = useCallback((id) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    
    // Persist read status
    const readIds = JSON.parse(localStorage.getItem("readNotifications") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("readNotifications", JSON.stringify(readIds.slice(-200))); // Keep last 200
    }
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => {
      const newItems = prev.map((n) => ({ ...n, read: true }));
      const readIds = JSON.parse(localStorage.getItem("readNotifications") || "[]");
      newItems.forEach(n => {
        if (!readIds.includes(n.id)) readIds.push(n.id);
      });
      localStorage.setItem("readNotifications", JSON.stringify(readIds.slice(-200)));
      return newItems;
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);
  
  useEffect(() => {
    const handler = (data) => {
      push({
        id: `churn-email-${data.memberId}-${Date.now()}`,
        title: "Churn Email Sent",
        message: `Encouragement email sent to ${data.memberName}.`,
        variant: "success",
        meta: { memberId: data.memberId }
      });
    };
    socket.on("notification:churn-email", handler);
    return () => socket.off("notification:churn-email", handler);
  }, [push]);

  useEffect(() => {
    // Fetch members whose subscription ends tomorrow
    async function fetchExpiring() {
      try {
        const res = await API.get("/members/expiring-tomorrow");
        if (Array.isArray(res.data)) {
          res.data.forEach((m) => {
            push({
              id: `expiring-${m._id}-${new Date().toDateString()}`,
              title: "Subscription Ending",
              message: `${m.name}'s payment will be expired on ${new Date(m.subscriptionEnd).toLocaleDateString()}`,
              variant: "warning",
              meta: { memberId: m._id },
            });
          });
        }
      } catch (err) {
        console.error("Failed to fetch expiring members:", err);
      }
    }

    fetchExpiring();
    // Re-check every hour to keep it fresh
    const interval = setInterval(fetchExpiring, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [push]);

  const unreadCount = useMemo(
    () => items.reduce((acc, n) => acc + (n.read ? 0 : 1), 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, unreadCount, push, markRead, markAllRead, clear }),
    [items, unreadCount, push, markRead, markAllRead, clear],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
