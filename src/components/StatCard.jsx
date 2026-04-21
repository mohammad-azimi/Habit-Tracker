export default function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="text-3xl font-semibold mt-2">{value}</div>
    </div>
  );
}
