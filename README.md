# Aegis — Multimodal AI Incident Investigator

Aegis is a local-first incident investigation workspace that correlates logs, metrics, deployments, Git changes, conversations, reports, and images. It reconstructs an evidence-backed timeline, evaluates competing hypotheses, exposes deterministic confidence scoring, and keeps a safe audit replay of agent actions.

The seeded checkout incident works without API keys. It deliberately includes a plausible payment-provider alternative and contradictory evidence so the system demonstrates investigation rather than summarization.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs on `http://localhost:8787`. For a production-style local run: `docker compose up --build`, then open `http://localhost:8787`.

```bash
npm test
npm run build
npm run generate:incident -- --service=orders-api --failure="dependency timeout" --seed=7
```

## Architecture

```text
React UI ── REST / SSE ── Express API
   │                         ├── ingestion + safe upload boundary
   │                         ├── deterministic investigation engine
   │                         ├── hybrid retrieval and confidence scoring
   │                         └── provider abstraction (mock by default)
   │                                      │
   └── timeline / graph / replay     local state + object files
```

Key behavior includes clickable provenance, cross-source timeline reconstruction, statistical anomaly context, code-diff findings, alternative hypotheses, human feedback, evidence-linked recommendations, evaluation results, command palette (`⌘K`), dark/light themes, and responsive layouts.

## Configuration

Copy `.env.example` to `.env`. `LLM_PROVIDER=mock` is deterministic and offline. Provider credentials are never stored or hard-coded. Uploaded evidence is size-limited, filenames are isolated by Multer, evidence is labelled untrusted, and replay only contains safe summaries—not hidden model reasoning.

## API

- `GET /api/incidents`
- `POST /api/incidents`
- `GET /api/incidents/:id/investigation`
- `POST /api/incidents/:id/evidence`
- `GET /api/incidents/:id/stream`
- `POST /api/incidents/:id/feedback`

See [architecture](docs/architecture.md), [AI system](docs/ai-system.md), [security](docs/security.md), [evaluation](docs/evaluation.md), and [demo](docs/demo.md).

The initial development sequence is captured in the [seven-day engineering roadmap](docs/seven-day-roadmap.md). A scheduled workflow runs tests, the production build, and a dependency audit each morning during that window without generating artificial commits.

## Current limitations

The included state store is intentionally lightweight for one-command portfolio use; production deployments should replace it with PostgreSQL/pgvector and an S3-compatible object store. OCR/image extraction and external model providers are represented through typed evidence and provider boundaries but require a configured provider in a real deployment.
