import { Pause, Play } from "lucide-react";
import { clockDuration } from "../utils/format";
import { useElapsed } from "../hooks/useElapsed";

export const TimerPanel = ({ activeTimer, onStop, onGoTasks, compact = false }) => {
  const elapsed = useElapsed(activeTimer?.startedAt);
  if (!activeTimer) {
    return (
      <section className={`timer-panel empty ${compact ? "compact" : ""}`}>
        <div><span className="eyebrow">Timer</span><h3>No active session</h3><p>Start a task to capture focused work.</p></div>
        <button className="secondary-btn" onClick={onGoTasks}><Play size={16} /> Start working</button>
      </section>
    );
  }
  return (
    <section className={`timer-panel active ${compact ? "compact" : ""}`}>
      <div>
        <span className="eyebrow">Now tracking</span>
        <h3>{activeTimer.task.title}</h3>
        <div className="timer-clock">{clockDuration(elapsed)}</div>
      </div>
      <button className="stop-btn" onClick={() => onStop(activeTimer.taskId)}><Pause size={16} /> Stop session</button>
    </section>
  );
};
