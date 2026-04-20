# pvtsale

Confidential token launchpad on **Ethereum Sepolia** using Fhenix **CoFHE**: `cWETH` contributions with FHE-protected amounts, factory-deployed presales, and `cTOKEN` allocation flows. Presale metadata (addresses, timing, calldata shape) is public on-chain; contribution sizes are handled in the FHE layer.

**Repository:** [github.com/ThunderSNOWview/pvtsale](https://github.com/ThunderSNOWview/pvtsale)

## Layout

| Path | Purpose |
|------|---------|
| `ui/` | Vite + React frontend (primary deploy target) |
| `contracts/` | Hardhat Solidity (`PrivacyPresale`, factory, cWETH-related contracts) |
| `docs/` | Design notes (e.g. `PRESALE.md`) |

## Frontend: local development

```bash
cd ui
cp .env.example .env
# Set at least VITE_WALLETCONNECT_PROJECT_ID (and any RPC URLs your setup needs)
npm install
npm run dev
```

The dev server defaults to [http://localhost:3000](http://localhost:3000) (see `ui/vite.config.ts`).

## Frontend: production build

```bash
cd ui
npm ci
npm run build
npm run preview   # optional: serve dist/
```

## Deploy on Vercel

1. Import this repo in [Vercel](https://vercel.com) → New Project.
2. Set **Root Directory** to `ui`.
3. Framework: **Vite** (install `npm ci`, build `npm run build`, output `dist`).
4. Add environment variables from `ui/.env.example` (at minimum `VITE_WALLETCONNECT_PROJECT_ID`).
5. `ui/vercel.json` includes SPA rewrites so client routes (`/raises`, `/docs`, etc.) resolve correctly.

## Contracts

```bash
cd contracts
npm install
npm run compile
```

Never commit private keys or `contracts/.env`. Use local env or CI secrets only.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). This project uses the [Contributor Covenant](CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](SECURITY.md) for how to report vulnerabilities.

## License

[MIT](LICENSE).
