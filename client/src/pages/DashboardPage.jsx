import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, Clock3, ListTodo, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, post } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { formatDuration, titleCaseStatus } from "../utils/format";
import { StatCard } from "../components/StatCard";
import { TimerPanel } from "../components/TimerPanel";
import { WeeklyChart } from "../components/WeeklyChart";

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();
  const today = useQuery({ queryKey: ["summary", "today"], queryFn: () => api("/summary/today").then((result) => result.summary) });
  const weekly = useQuery({ queryKey: ["summary", "weekly"], queryFn: () => api("/summary/weekly").then((result) => result.summary) });
  const active = useQuery({ queryKey: ["timer", "active"], queryFn: () => api("/time/active").then((result) => result.activeTimer) });
  const stop = useMutation({
    mutationFn: (taskId) => post(`/tasks/${taskId}/timer/stop`, {}),
    onSuccess: () => {
      client.invalidateQueries();
      toast.success("Session saved.");
    },
    onError: (error) => toast.error(error.message),
  });
  const summary = today.data;

  return (
    <div className="content">
      <section className="page-heading">
        <div><span className="eyebrow">Dashboard</span><h1>Good {greeting()}, {user?.name?.split(" ")[0]}.</h1><p>Here is how your focus is taking shape today.</p></div>
        <div className="date-chip">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
      </section>
      <TimerPanel activeTimer={active.data} onStop={stop.mutate} onGoTasks={() => navigate("/tasks")} />
      <section className="daily-summary" aria-label="Daily summary">
        <div className="section-heading">
          <div><h2>Daily Summary</h2><p>Today&apos;s tracked work and task progress</p></div>
          <span className="summary-date">Today</span>
        </div>
        <div className="stats-grid">
          <StatCard icon={Clock3} label="Total time tracked" value={formatDuration(summary?.trackedSeconds)} detail="Today" />
          <StatCard icon={Target} label="Tasks worked on" value={summary?.tasksWorkedOn.length ?? 0} detail="Touched today" tone="blue" />
          <StatCard icon={CheckCircle2} label="Completed tasks" value={summary?.completedToday ?? 0} detail="Finished today" tone="green" />
          <StatCard icon={ListTodo} label="Pending / In progress" value={summary?.openTasks ?? 0} detail="Still open" tone="orange" />
        </div>
      </section>
      <div className="dashboard-grid">
        <WeeklyChart days={weekly.data?.days} />
        <div className="dashboard-stack">
          <section className="card activity-card">
            <div className="card-title"><div><h2>Tasks Worked On Today</h2><p>Included in the daily summary</p></div><button onClick={() => navigate("/tasks")}>All tasks</button></div>
            {summary?.tasksWorkedOn.length ? summary.tasksWorkedOn.map((task) => (
              <div className="activity" key={task.id}>
                <div><strong>{task.title}</strong><small className={`status ${task.status.toLowerCase()}`}>{titleCaseStatus(task.status)}</small></div>
                <span>{formatDuration(task.trackedSeconds)}</span>
              </div>
            )) : <div className="blank-state">No sessions recorded today. Start a task to see activity here.</div>}
          </section>
          <section className="card reminder-card">
            <div className="card-title"><div><h2>Reminders</h2><p>Upcoming task deadlines</p></div><Bell size={18} /></div>
            {summary?.reminders?.length ? summary.reminders.map((task) => (
              <div className="reminder" key={task.id}>
                <div><strong>{task.title}</strong><small>{reminderLabel(task.dueDate)}</small></div>
                <span className={`priority-dot ${task.priority.toLowerCase()}`} />
              </div>
            )) : <div className="blank-state compact">Add a deadline to a task to create a reminder.</div>}
          </section>
        </div>
      </div>
    </div>
  );
};

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
};

const reminderLabel = (dueDate) => {
  const date = new Date(dueDate);
  if (date < new Date()) return `Overdue · ${date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
  return `Due ${date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
};
