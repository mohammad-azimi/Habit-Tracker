import { FileText } from "lucide-react";
import MentalTrendChart from "./MentalTrendChart";

export default function MentalStateSection({
  daysInMonth,
  mood,
  motivation,
  mentalStateData,
  onSetMentalMetric,
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-semibold">Mental State</div>
        <FileText className="h-4 w-4 text-neutral-400" />
      </div>

      <div className="mb-5 overflow-x-auto">
        <div className="min-w-[900px] space-y-2">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(42px, 1fr))`,
            }}
          >
            <div></div>
            {Array.from({ length: daysInMonth }, (_, i) => (
              <div key={i} className="text-[10px] text-center text-neutral-500">
                {i + 1}
              </div>
            ))}
          </div>

          <div
            className="grid items-center gap-1"
            style={{
              gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(42px, 1fr))`,
            }}
          >
            <div className="rounded-xl bg-neutral-800 px-3 py-2 text-sm">
              Mood
            </div>
            {mood.map((value, dayIndex) => (
              <input
                key={dayIndex}
                type="number"
                min="1"
                max="10"
                value={value}
                onChange={(e) =>
                  onSetMentalMetric("mood", dayIndex, e.target.value)
                }
                className="h-10 rounded-xl border border-neutral-800 bg-neutral-950 text-center text-sm outline-none"
              />
            ))}
          </div>

          <div
            className="grid items-center gap-1"
            style={{
              gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(42px, 1fr))`,
            }}
          >
            <div className="rounded-xl bg-neutral-800 px-3 py-2 text-sm">
              Motivation
            </div>
            {motivation.map((value, dayIndex) => (
              <input
                key={dayIndex}
                type="number"
                min="1"
                max="10"
                value={value}
                onChange={(e) =>
                  onSetMentalMetric("motivation", dayIndex, e.target.value)
                }
                className="h-10 rounded-xl border border-neutral-800 bg-neutral-950 text-center text-sm outline-none"
              />
            ))}
          </div>
        </div>
      </div>

      <MentalTrendChart
        mood={mood}
        motivation={motivation}
        mentalStateData={mentalStateData}
      />
    </div>
  );
}
