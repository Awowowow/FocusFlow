import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, Edit3, MoreHorizontal, Play, Plus, Search, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, patch, post, remove } from "../api/client";
import { TaskFormModal } from "../components/TaskFormModal";
import { TimerPanel } from "../components/TimerPanel";
import { formatDuration, titleCaseStatus } from "../utils/format";

const filters = [{ label: "All", value: "" }, { label: "Pending", value: "PENDING" }, { label: "In progress", value: "IN_PROGRESS" }, { label: "Completed", value: "COMPLETED" }];

export const TasksPage = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [modalTask, setModalTask] = useState(undefined);
  const [menuId, setMenuId] = useState(null);
  const query = new URLSearchParams({ ...(status && { status }), ...(search && { search }) }).toString();
  const tasks = useQuery({ queryKey: ["tasks", status, search], queryFn: () => api(`/tasks?${query}`).then((data) => data.tasks) });
  const active = useQuery({ queryKey: ["timer", "active"], queryFn: () => api("/time/active").then((data) => data.activeTimer) });
  const refresh = () => queryClient.invalidateQueries();
  const save = useMutation({
    mutationFn: (payload) => modalTask?.id ? patch(`/tasks/${modalTask.id}`, payload) : post("/tasks", payload),
    onSuccess: () => { refresh(); setModalTask(undefined); toast.success("Task saved."); },
    onError: (error) => toast.error(error.message),
  });
  const erase = useMutation({
    mutationFn: (taskId) => remove(`/tasks/${taskId}`),
    onSuccess: () => { refresh(); toast.success("Task deleted."); },
    onError: (error) => toast.error(error.message),
  });
  const timer = useMutation({
    mutationFn: ({ taskId, action }) => post(`/tasks/${taskId}/timer/${action}`, {}),
    onSuccess: (_result, variables) => { refresh(); toast.success(variables.action === "start" ? "Timer started." : "Session saved."); },
    onError: (error) => toast.error(error.message),
  });
  const complete = useMutation({
    mutationFn: (taskId) => patch(`/tasks/${taskId}`, { status: "COMPLETED" }),
    onSuccess: () => { refresh(); toast.success("Task completed."); },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="content">
      <section className="page-heading task-heading">
        <div><span className="eyebrow">Tasks</span><h1>Your work queue</h1><p>Create tasks naturally, then turn effort into measurable progress.</p></div>
        <button className="primary-btn" onClick={() => setModalTask(null)}><Plus size={17} /> New task</button>
      </section>
      <TimerPanel compact activeTimer={active.data} onStop={(taskId) => timer.mutate({ taskId, action: "stop" })} onGoTasks={() => setModalTask(null)} />
      <section className="card task-board">
        <div className="task-controls">
          <div className="search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" /></div>
          <div className="filters">{filters.map((filter) => <button key={filter.value} className={status === filter.value ? "selected" : ""} onClick={() => setStatus(filter.value)}>{filter.label}</button>)}</div>
        </div>
        <div className="task-list">
          {tasks.isLoading && <div className="blank-state">Loading your tasks...</div>}
          {tasks.data?.map((task) => {
            const running = active.data?.taskId === task.id;
            return (
              <article className="task-row" key={task.id}>
                <div className={`priority ${task.priority.toLowerCase()}`} />
                <div className="task-copy">
                  <div>
                    <h3>{task.title}</h3>
                    <span className={`status ${task.status.toLowerCase()}`}>{titleCaseStatus(task.status)}</span>
                    {task.status !== "COMPLETED" && !running && (
                      <button className="quick-complete" disabled={complete.isPending} onClick={() => complete.mutate(task.id)}><CheckCircle2 size={13} /> Mark complete</button>
                    )}
                  </div>
                  <p>{task.description || "No description added."}</p>
                  {task.dueDate && task.status !== "COMPLETED" && <small className={`task-reminder ${new Date(task.dueDate) < new Date() ? "overdue" : ""}`}><Bell size={12} /> {formatDeadline(task.dueDate)}</small>}
                </div>
                <div className="tracked"><small>Tracked</small><strong>{formatDuration(task.trackedSeconds)}</strong></div>
                <button className={running ? "stop-task" : "start-task"} onClick={() => timer.mutate({ taskId: task.id, action: running ? "stop" : "start" })}>
                  {running ? <Square size={14} /> : <Play size={14} />}{running ? "Stop" : "Start"}
                </button>
                <div className="row-actions">
                  <button className="icon-btn" onClick={() => setMenuId(menuId === task.id ? null : task.id)}><MoreHorizontal size={18} /></button>
                  {menuId === task.id && (
                    <div className="menu">
                      <button onClick={() => { setModalTask(task); setMenuId(null); }}><Edit3 size={15} /> Edit</button>
                      <button className="danger" onClick={() => erase.mutate(task.id)}><Trash2 size={15} /> Delete</button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
          {!tasks.isLoading && !tasks.data?.length && <div className="blank-state">No matching tasks. Create one and start a focus session.</div>}
        </div>
      </section>
      {modalTask !== undefined && <TaskFormModal key={modalTask?.id ?? "new"} task={modalTask} saving={save.isPending} onSave={save.mutate} onClose={() => setModalTask(undefined)} />}
    </div>
  );
};

const formatDeadline = (dueDate) => {
  const date = new Date(dueDate);
  const prefix = date < new Date() ? "Overdue" : "Due";
  return `${prefix} ${date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
};
