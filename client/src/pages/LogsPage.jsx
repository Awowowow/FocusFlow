import { useQuery } from "@tanstack/react-query";
import { Clock3 } from "lucide-react";
import { format } from "date-fns";
import { api } from "../api/client";
import { formatDuration } from "../utils/format";

export function LogsPage() {
  const logs = useQuery({ queryKey: ["logs"], queryFn: () => api("/time/logs?limit=50").then((data) => data.timeLogs) });
  return (
    <div className="content">
      <section className="page-heading">
        <div><span className="eyebrow">History</span><h1>Time logs</h1><p>A trustworthy record of every focus session.</p></div>
      </section>
      <section className="card logs-card">
        <div className="card-title"><div><h2>Recent sessions</h2><p>Latest 50 activity entries</p></div></div>
        {logs.data?.map((log) => (
          <article className="log-row" key={log.id}>
            <div className="log-icon"><Clock3 size={18} /></div>
            <div><strong>{log.task.title}</strong><small>{format(new Date(log.startedAt), "MMM d, yyyy · h:mm a")}</small></div>
            <span>{log.endedAt ? formatDuration(log.durationSeconds) : "Running"}</span>
          </article>
        ))}
        {!logs.isLoading && !logs.data?.length && <div className="blank-state">Your completed focus sessions will appear here.</div>}
      </section>
    </div>
  );
}

