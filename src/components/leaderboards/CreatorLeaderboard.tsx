type CreatorRow = {
  rank: number;
  handle: string;
  earnings: number;
  paidSeconds: number;
  followers: number;
};

export function CreatorLeaderboard({ rows }: { rows: CreatorRow[] }) {
  return (
    <div className="glass-panel overflow-x-auto p-4 text-sm">
      <table className="w-full">
        <thead className="text-left text-xs text-chalk/60">
          <tr>
            <th>Rank</th>
            <th>Creator</th>
            <th>Earnings USDC</th>
            <th>Paid Seconds</th>
            <th>Supporters</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rank}>
              <td>{row.rank}</td>
              <td>{row.handle}</td>
              <td>{row.earnings.toFixed(2)}</td>
              <td>{row.paidSeconds}</td>
              <td>{row.followers}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
