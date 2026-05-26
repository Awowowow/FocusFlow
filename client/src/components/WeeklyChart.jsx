import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDuration } from "../utils/format";

export function WeeklyChart({ days = [] }) {
  const chartData = days.map((day) => ({ ...day, minutes: Math.round(day.trackedSeconds / 60) }));
  return (
    <section className="card chart-card">
      <div className="card-title"><div><h2>Weekly focus</h2><p>Time tracked during the last seven days</p></div></div>
      <div className="chart">
        <ResponsiveContainer width="100%" height={252} minWidth={0}>
          <BarChart data={chartData} barSize={30}>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="4 4" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} unit="m" width={38} />
            <Tooltip cursor={{ fill: "var(--hover)" }} content={({ active, payload }) => active && payload?.length ? <div className="chart-tooltip">{formatDuration(payload[0].payload.trackedSeconds)}</div> : null} />
            <Bar dataKey="minutes" fill="var(--accent)" radius={[8, 8, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
