import { Leaf, Shield, Sparkles } from "lucide-react";

const items = [
  {
    icon: Shield,
    title: "Encrypted contribution path",
    body: "Buyers use cWETH; transfer amounts are FHE values. Soft cap, hard cap, and per-wallet bounds still compare on-chain without publishing each ticket size.",
    tint: "from-teal-100/90 to-emerald-50",
  },
  {
    icon: Sparkles,
    title: "Standard wallets, CoFHE client",
    body: "Connect on Sepolia like any dApp. The UI uses @cofhe/sdk to encrypt inputs, approve in ciphertext, and decrypt balances when you choose to reveal them.",
    tint: "from-amber-100/90 to-orange-50",
  },
  {
    icon: Leaf,
    title: "Factory + presale + cTOKEN",
    body: "One flow deploys your confidential wrapper (cTOKEN) and presale contract, moves the token budget, and finalizes with verified decrypt when the window ends — refunds if the soft cap misses.",
    tint: "from-rose-100/80 to-stone-50",
  },
];

export default function HomeFeatures() {
  return (
    <section className="grid gap-5 md:grid-cols-3">
      {items.map(({ icon: Icon, title, body, tint }) => (
        <article
          key={title}
          className={`relative overflow-hidden rounded-3xl border border-stone-200/80 bg-gradient-to-br ${tint} p-6 shadow-sm`}
        >
          <div className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-white/80 text-primary shadow-sm">
            <Icon className="size-5 stroke-[1.75]" />
          </div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-stone-900">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{body}</p>
        </article>
      ))}
    </section>
  );
}
