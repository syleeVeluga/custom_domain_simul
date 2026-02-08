# Custom Domain Simulation

Custom domain connection flow simulator based on the PRD.

## Features

- Mode A (Zero Data) and Mode B (Dashboard) UI
- Magic domain scenarios (success, TXT/CNAME failure, SSL hang, error)
- Mock API with delayed responses
- SSL provisioning progress polling

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Framer Motion

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Magic Domain Rules

| Domain | Behavior |
| --- | --- |
| success.com | Happy path, all checks succeed |
| fail-txt.com | TXT verification fails |
| fail-cname.com | CNAME verification fails |
| ssl-hang.com | SSL provisioning stalls |
| error.com | Domain registration fails |
| (other) | Same as success.com with random delay |

## Scripts

```bash
npm run dev
npm run build
npm run preview
```
