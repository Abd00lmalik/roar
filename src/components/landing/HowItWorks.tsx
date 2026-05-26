export function HowItWorks() {
  return (
    <section className="mx-auto mt-16 w-full max-w-5xl px-4 pb-20">
      <h2 className="mb-6 font-display text-3xl font-bold text-floodlight">How It Works</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="glass-panel p-4">
          <h3 className="font-semibold">① Choose Your Country</h3>
          <p className="mt-2 text-sm text-chalk/80">
            Pick from 48 fan nations and wear their colors all tournament.
          </p>
        </article>
        <article className="glass-panel p-4">
          <h3 className="font-semibold">② Watch 2 Minutes Free</h3>
          <p className="mt-2 text-sm text-chalk/80">
            Every video starts with 2 cumulative free minutes. No wallet needed.
          </p>
        </article>
        <article className="glass-panel p-4">
          <h3 className="font-semibold">③ Pay Per Second, Earn Together</h3>
          <p className="mt-2 text-sm text-chalk/80">
            Deposit USDC on X Layer and pay 0.0001/sec. 85% goes to the creator.
          </p>
        </article>
      </div>
    </section>
  );
}
