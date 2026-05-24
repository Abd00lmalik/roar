interface EmptyStateProps {
  icon:    string;
  heading: string;
  body:    string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, heading, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="text-5xl">{icon}</span>
      <h3 className="text-lg font-semibold text-chalk">{heading}</h3>
      <p className="text-sm text-white/50 max-w-xs">{body}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-5 py-2 rounded-xl bg-[var(--country-accent)] text-black text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
