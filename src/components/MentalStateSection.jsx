import { FileText } from "lucide-react";
import MentalTrendChart from "./MentalTrendChart";

function MetricRow({ label, values, metricKey, onSetMentalMetric, accent }) {
  const labelClass =
    accent === "violet"
      ? "mental-metric-label mental-metric-label-violet"
      : "mental-metric-label mental-metric-label-sky";

  return (
    <div
      className="grid items-center gap-1"
      style={{
        gridTemplateColumns: `120px repeat(${values.length}, minmax(42px, 1fr))`,
      }}
    >
      <div
        className={`rounded-xl border px-3 py-2 text-sm font-semibold ${labelClass}`}
      >
        {label}
      </div>

      {values.map((value, dayIndex) => (
        <input
          key={dayIndex}
          type="number"
          min="1"
          max="10"
          value={value}
          onChange={(e) =>
            onSetMentalMetric(metricKey, dayIndex, e.target.value)
          }
          className="mental-metric-input h-10 rounded-xl border text-center text-sm outline-none transition"
        />
      ))}
    </div>
  );
}

export default function MentalStateSection({
  daysInMonth,
  mood,
  motivation,
  mentalStateData,
  onSetMentalMetric,
  showChart = true,
  title = "Mental State",
  subtitle = "Track your daily mood and motivation through the month",
}) {
  return (
    <div className="theme-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="theme-section-title text-lg">{title}</div>
          <div className="theme-section-subtitle text-xs">{subtitle}</div>
        </div>

        <div className="theme-card-muted p-2">
          <FileText className="h-4 w-4 text-neutral-400" />
        </div>
      </div>

      <div className={showChart ? "mb-5 overflow-x-auto" : "overflow-x-auto"}>
        <div className="min-w-[900px] space-y-2">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(42px, 1fr))`,
            }}
          >
            <div />
            {Array.from({ length: daysInMonth }, (_, i) => (
              <div
                key={i}
                className="rounded-md py-1 text-center text-[10px] text-neutral-500"
              >
                {i + 1}
              </div>
            ))}
          </div>

          <MetricRow
            label="Mood"
            values={mood}
            metricKey="mood"
            onSetMentalMetric={onSetMentalMetric}
            accent="violet"
          />

          <MetricRow
            label="Motivation"
            values={motivation}
            metricKey="motivation"
            onSetMentalMetric={onSetMentalMetric}
            accent="sky"
          />
        </div>
      </div>

      {showChart ? (
        <div className="theme-chart-panel p-4">
          <MentalTrendChart
            mood={mood}
            motivation={motivation}
            mentalStateData={mentalStateData}
          />
        </div>
      ) : null}
    </div>
  );
}
