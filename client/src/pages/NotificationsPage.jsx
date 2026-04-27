import { useMemo } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useNotifications } from "../context/NotificationsContext";

const variantToBadge = {
  neutral: "neutral",
  brand: "brand",
  success: "success",
  warning: "warning",
  danger: "danger",
};

export default function NotificationsPage() {
  const { items, unreadCount, markAllRead, clear, markRead } = useNotifications();
  const rows = useMemo(() => items, [items]);

  return (
    <div className="grid gap-4 md:gap-6">
      <Card className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white">Notifications</div>
            <div className="mt-0.5 text-xs text-white/50">
              Live updates from attendance and gamification events.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={unreadCount ? "brand" : "neutral"}>
              {unreadCount ? `${unreadCount} unread` : "All read"}
            </Badge>
            <Button variant="ghost" onClick={markAllRead}>
              Mark all read
            </Button>
            <Button variant="ghost" onClick={clear}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {rows.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="text-sm font-semibold text-white">No notifications yet</div>
          <div className="mt-1 text-xs text-white/50">
            When check-ins happen, you’ll see updates here instantly.
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {rows.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => markRead(n.id)}
              className="text-left glass p-4 transition hover:bg-white/[0.08] hover:border-white/16 focus:outline-none focus-visible:focus-ring"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-white truncate">{n.title}</div>
                    <Badge variant={variantToBadge[n.variant] || "neutral"}>{n.variant}</Badge>
                  </div>
                  {n.message ? (
                    <div className="mt-1 text-xs text-white/55">{n.message}</div>
                  ) : null}
                </div>
                <div className="text-[11px] text-white/45 shrink-0">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.read ? <div className="mt-2 h-1 w-10 rounded-full bg-brand-400/50" /> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

