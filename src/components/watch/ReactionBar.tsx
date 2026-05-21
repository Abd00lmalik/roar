const reactions = [
  "🌶️ Hot Take",
  "📊 Great Analysis",
  "😂 Banter",
  "🧠 Tactical",
  "🙅 Disagree",
];

export function ReactionBar() {
  return (
    <div className="glass-panel flex flex-wrap gap-2 p-3 text-xs">
      {reactions.map((reaction) => (
        <button key={reaction} className="rounded bg-white/10 px-2 py-1 hover:bg-white/20">
          {reaction}
        </button>
      ))}
    </div>
  );
}
