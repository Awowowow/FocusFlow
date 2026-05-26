import { useState } from "react";
import { format } from "date-fns";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { post } from "../api/client";

const inputDateTime = (value) => value ? format(new Date(value), "yyyy-MM-dd'T'HH:mm") : "";

const blank = { originalInput: "", title: "", description: "", priority: "MEDIUM", status: "PENDING", dueDate: "" };

export const TaskFormModal = ({ task, onSave, onClose, saving }) => {
  const [form, setForm] = useState(() => task ? { ...blank, ...task, originalInput: task.originalInput ?? "", dueDate: inputDateTime(task.dueDate) } : blank);
  const [suggesting, setSuggesting] = useState(false);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const improve = async () => {
    if (form.originalInput.trim().length < 3) return toast.error("Write a rough task idea first.");
    setSuggesting(true);
    try {
      const { suggestion } = await post("/tasks/suggest", { input: form.originalInput });
      setForm((current) => ({ ...current, title: suggestion.title, description: suggestion.description }));
      toast.success(suggestion.source === "gemini" ? "Gemini suggestion ready" : "Smart suggestion ready");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSuggesting(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    onSave({
      title: form.title,
      description: form.description || null,
      originalInput: form.originalInput || null,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      ...(task && { status: form.status }),
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <div className="modal-heading">
          <div><h2>{task ? "Edit task" : "New task"}</h2><p>Turn an idea into trackable work.</p></div>
          <button type="button" className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        {!task && (
          <div className="natural-input">
            <label htmlFor="originalInput">Natural language input</label>
            <div className="ai-row">
              <input id="originalInput" name="originalInput" value={form.originalInput} onChange={update} placeholder="e.g. follow up with product designer" />
              <button type="button" className="ai-btn" disabled={suggesting} onClick={improve}><Sparkles size={15} />{suggesting ? "Thinking..." : "Improve"}</button>
            </div>
          </div>
        )}
        <label>Title<input name="title" required maxLength={120} value={form.title} onChange={update} placeholder="What needs to be done?" /></label>
        <label>Description<textarea name="description" rows="4" maxLength={1000} value={form.description ?? ""} onChange={update} placeholder="Notes, context, or a clear next step" /></label>
        <div className="two-fields">
          <label>Priority<select name="priority" value={form.priority} onChange={update}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label>
          {task && <label>Status<select name="status" value={form.status} onChange={update}><option value="PENDING">Pending</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select></label>}
        </div>
        <label>Reminder deadline<input name="dueDate" type="datetime-local" value={form.dueDate} onChange={update} /></label>
        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
          <button className="primary-btn" disabled={saving}>{saving ? "Saving..." : task ? "Save changes" : "Create task"}</button>
        </div>
      </form>
    </div>
  );
};
