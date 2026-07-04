export default function EmptyState({ icon = '🛍️', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="font-display text-xl font-semibold text-neutral-800">
        {title}
      </h3>
      {message && <p className="mt-2 max-w-sm text-sm text-neutral-500">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
