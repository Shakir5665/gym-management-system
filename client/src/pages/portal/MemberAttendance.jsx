import { useState, useEffect } from "react";
import API from "../../api/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Clock } from "lucide-react";
import { socket } from "../../socket";
import { useAuth } from "../../context/AuthContext";

export default function MemberAttendance() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await API.get("/portal/attendance");
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();

    const onAttendance = (payload) => {
      if (user?.memberId && payload.memberId === user.memberId) {
        console.log("🔄 Live Update: Attendance list");
        fetchAttendance(true);
      }
    };

    socket.on("attendance:new", onAttendance);
    return () => socket.off("attendance:new", onAttendance);
  }, [user?.memberId]);

  if (loading) return <div className="p-10 text-center animate-pulse text-[color:var(--muted)] font-bold">Loading History...</div>;

  return (
    <div className="grid gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-[color:var(--text)]">Attendance History</h1>
        <p className="text-sm text-[color:var(--muted)] font-medium">Your activity over the last 50 visits.</p>
      </div>

      <div className="grid gap-4">
        {logs.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2">
            <div className="text-[color:var(--muted)] italic">No attendance records found. Start your journey today!</div>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log._id} className="p-4 flex items-center justify-between hover:bg-[color:var(--control-bg)]/40 transition">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/10">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[color:var(--text)]">
                    {new Date(log.checkInTime || log.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="text-[10px] text-[color:var(--muted)] font-bold uppercase tracking-wider mt-0.5">
                    Check-in at {new Date(log.checkInTime || log.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    {log.checkOutTime && ` • Out at ${new Date(log.checkOutTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`}
                  </div>
                </div>
              </div>
              <Badge variant={log.status === "SUCCESS" ? "success" : "danger"}>
                {log.status}
              </Badge>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
