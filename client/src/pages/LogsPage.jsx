import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, Edit3, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { api, patch, post, remove } from "../api/client";
import { TimeLogModal } from "../components/TimeLogModal";
import { formatDuration } from "../utils/format";

export const LogsPage = () => {
  const queryClient = useQueryClient();
  const [modalLog, setModalLog] = useState(undefined);
  const logs = useQuery({ queryKey: ["logs"], queryFn: () => api("/time/logs?limit=50").then((data) => data.timeLogs) });
  const tasks = useQuery({ queryKey: ["tasks", "log-picker"], queryFn: () => api("/tasks?sort=updated").then((data) => data.tasks) });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["logs"] });
    queryClient.invalidateQueries({ queryKey: ["summary"] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };
  const save = useMutation({
    mutationFn: (payload) => modalLog?.id ? patch(`/time/logs/${modalLog.id}`, payload) : post("/time/logs", payload),
    onSuccess: () => {
      refresh();
      setModalLog(undefined);
      toast.success(modalLog?.id ? "Time log updated." : "Time log added.");
    },
    onError: (error) => toast.error(error.message),
  });
  const erase = useMutation({
    mutationFn: (logId) => remove(`/time/logs/${logId}`),
    onSuccess: () => {
      refresh();
      toast.success("Time log deleted.");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteLog = (logId) => {
    if (window.confirm("Delete this time log?")) erase.mutate(logId);
  };

  return (
    <div className="content">
      <section className="page-heading">
        <div><span className="eyebrow">History</span><h1>Time logs</h1><p>A trustworthy record of every focus session.</p></div>
        <button className="primary-btn" onClick={() => setModalLog(null)}><Plus size={17} /> Add time</button>
      </section>
      <section className="card logs-card">
        <div className="card-title"><div><h2>Recent sessions</h2><p>Latest 50 activity entries</p></div></div>
        {logs.data?.map((log) => (
          <article className="log-row" key={log.id}>
            <div className="log-icon"><Clock3 size={18} /></div>
            <div><strong>{log.task.title}</strong><small>{format(new Date(log.startedAt), "MMM d, yyyy · h:mm a")}{log.note && ` · ${log.note}`}</small></div>
            <span>{log.endedAt ? formatDuration(log.durationSeconds) : "Running"}</span>
            <div className="log-actions">
              {log.endedAt && <button className="icon-btn" aria-label="Edit time log" onClick={() => setModalLog(log)}><Edit3 size={16} /></button>}
              {log.endedAt && <button className="icon-btn danger" aria-label="Delete time log" onClick={() => deleteLog(log.id)}><Trash2 size={16} /></button>}
            </div>
          </article>
        ))}
        {!logs.isLoading && !logs.data?.length && <div className="blank-state">Your completed focus sessions will appear here.</div>}
      </section>
      {modalLog !== undefined && <TimeLogModal key={modalLog?.id ?? "new"} log={modalLog} tasks={tasks.data ?? []} saving={save.isPending} onSave={save.mutate} onClose={() => setModalLog(undefined)} />}
    </div>
  );
};
