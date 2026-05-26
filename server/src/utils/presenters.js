export const publicUser = ({ id, name, email, timezone, createdAt }) => ({
  id,
  name,
  email,
  timezone,
  createdAt,
});

export function taskWithTrackedTime(task, now = new Date()) {
  const trackedSeconds = task.timeLogs.reduce((total, log) => {
    if (log.durationSeconds != null) return total + log.durationSeconds;
    return total + Math.max(0, Math.floor((now - new Date(log.startedAt)) / 1000));
  }, 0);
  const activeLog = task.timeLogs.find((log) => !log.endedAt) ?? null;
  const { timeLogs, ...taskFields } = task;
  return { ...taskFields, trackedSeconds, activeLog };
}

