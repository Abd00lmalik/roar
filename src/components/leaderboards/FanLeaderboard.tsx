type FanRow = {
  rank: number;
  handle: string;
  country: string;
  watchSeconds: number;
  badges: number;
  score: string;
};

export function FanLeaderboard({ rows }: { rows: FanRow[] }) {
  return (
    <div className="glass-panel overflow-x-auto p-4 text-sm">
      <table className="w-full">
        <thead className="text-left text-xs text-chalk/60">
          <tr>
            <th>Rank</th>
            <th>Fan</th>
            <th>Country</th>
            <th>Watch Seconds</th>
            <th>Badges</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rank}>
              <td>{row.rank}</td>
              <td>{row.handle}</td>
              <td>{row.country}</td>
              <td>{row.watchSeconds}</td>
              <td>{row.badges}</td>
              <td>{row.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
