import { useState } from "react";
import { format, subHours } from "date-fns";
import { X } from "lucide-react";

const inputDateTime = (value) => format(new Date(value), "yyyy-MM-dd'T'HH:mm");

const initialForm = (log, tasks) => {
  const endedAt = new Date();
  const startedAt = subHours(endedAt, 1);

  return log ? {
    taskId: log.task.id,
    startedAt: inputDateTime(log.startedAt),
    endedAt: inputDateTime(log.endedAt),
    note: log.note ?? "",
  } : {
    taskId: tasks[0]?.id ?? "",
    startedAt: inputDateTime(startedAt),
    endedAt: inputDateTime(endedAt),
    note: "",
  };
};

export const TimeLogModal = ({ log, tasks, onSave, onClose, saving }) => {
  const [form, setForm] = useState(() => initialForm(log, tasks));

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSave({
      ...(!log && { taskId: form.taskId }),
      startedAt: new Date(form.startedAt).toISOString(),
      endedAt: new Date(form.endedAt).toISOString(),
      note: form.note.trim() || null,
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <div className="modal-heading">
          <div><h2>{log ? "Edit time log" : "Add time log"}</h2><p>Record a focus session completed away from the timer.</p></div>
          <button type="button" className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        {log ? (
          <label>Task<input value={log.task.title} disabled /></label>
        ) : (
          <label>Task
            <select name="taskId" required value={form.taskId} onChange={update}>
              <option value="" disabled>Select a task</option>
              {tasks.map((task) => <option value={task.id} key={task.id}>{task.title}</option>)}
            </select>
          </label>
        )}
        <div className="two-fields">
          <label>Started at<input name="startedAt" type="datetime-local" required value={form.startedAt} onChange={update} /></label>
          <label>Ended at<input name="endedAt" type="datetime-local" required value={form.endedAt} onChange={update} /></label>
        </div>
        <label>Note<textarea name="note" rows="3" maxLength={280} value={form.note} onChange={update} placeholder="Optional context for this session" /></label>
        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
          <button className="primary-btn" disabled={saving || (!log && !tasks.length)}>{saving ? "Saving..." : log ? "Save log" : "Add session"}</button>
        </div>
      </form>
    </div>
  );
};
