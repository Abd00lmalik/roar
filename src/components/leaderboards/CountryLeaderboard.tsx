type CountryRow = {
  rank: number;
  country: string;
  supporters: number;
  paidSeconds: number;
  leading: boolean;
};

export function CountryLeaderboard({ rows }: { rows: CountryRow[] }) {
  return (
    <div className="glass-panel overflow-x-auto p-4 text-sm">
      <h3 className="mb-2 font-semibold">🏆 Global Cup Season — Country Rankings</h3>
      <table className="w-full">
        <thead className="text-left text-xs text-chalk/60">
          <tr>
            <th>Rank</th>
            <th>Country</th>
            <th>Supporters</th>
            <th>Paid Seconds</th>
            <th>Pool Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rank}>
              <td>{row.rank}</td>
              <td>{row.country}</td>
              <td>{row.supporters}</td>
              <td>{row.paidSeconds}</td>
              <td>{row.leading ? "🔥 Leading" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
