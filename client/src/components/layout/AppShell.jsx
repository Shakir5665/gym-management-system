import { Outlet, useLocation } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

const titles = [
  { match: "/app/dashboard", title: "Dashboard", subtitle: "Real-time analytics & gym health" },
  { match: "/app/members", title: "Members", subtitle: "Search, manage, and generate QR codes" },
  { match: "/app/scanner", title: "Scanner", subtitle: "Fast check-ins with QR" },
  { match: "/app/payments", title: "Payments", subtitle: "Track and accept membership payments" },
  { match: "/app/notifications", title: "Notifications", subtitle: "Live updates across the system" },
];

function getTitle(pathname) {
  const hit = titles.find((t) => pathname.startsWith(t.match));
  return hit || { title: "Gym Pro", subtitle: "Management Suite" };
}

export default function AppShell() {
  const { pathname } = useLocation();
  const { title, subtitle } = getTitle(pathname);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Topbar title={title} subtitle={subtitle} />
          <main className="mx-auto max-w-7xl px-4 md:px-8 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

