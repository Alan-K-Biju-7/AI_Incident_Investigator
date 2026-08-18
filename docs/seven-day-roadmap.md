# Seven-day engineering roadmap

This roadmap covers August 18–24, 2026. Each entry is a real, independently reviewable change. Commit only an entry that is implemented and verified; combine or split entries when the code naturally requires it.

Commit messages deliberately use plain language instead of conventional prefixes such as `feat:` or `chore:`.

## Day 1 — Repository foundation

- `Set up the Aegis application workspace`
- `Add deterministic incident investigation models`
- `Seed the checkout failure investigation`
- `Build the incident overview dashboard`
- `Add project health checks for the first week`

## Day 2 — Evidence ingestion

- `Validate uploaded evidence before storage`
- `Extract timestamps from application logs`
- `Normalize structured metric records`
- `Capture evidence provenance and reliability`
- `Cover ingestion failures with API tests`

## Day 3 — Retrieval and temporal reasoning

- `Rank evidence with metadata-aware retrieval`
- `Merge duplicate events in the reconstructed timeline`
- `Explain deployment-to-failure timing relationships`
- `Detect metric change points and lagged correlations`
- `Test timezone and approximate timestamp handling`

## Day 4 — Investigation agent

- `Define the investigation tool registry`
- `Add budget-aware investigation stopping rules`
- `Generate competing root cause hypotheses`
- `Search for evidence that challenges the leading cause`
- `Stream safe investigation summaries to the workspace`

## Day 5 — Investigator experience

- `Connect evidence citations to timeline events`
- `Make graph nodes inspectable from the workspace`
- `Explain every confidence score component`
- `Record accepted and rejected hypotheses as feedback`
- `Export the incident report as Markdown`

## Day 6 — Security and reliability

- `Isolate instructions found inside uploaded evidence`
- `Redact likely secrets from log previews`
- `Add upload rate and archive expansion limits`
- `Return structured errors for partial ingestion failures`
- `Exercise the seeded incident from upload to report`

## Day 7 — Evaluation and release

- `Generate reproducible evaluation incidents`
- `Measure timeline and evidence retrieval accuracy`
- `Calibrate confidence against observed outcomes`
- `Document the production deployment path`
- `Prepare the first Aegis demonstration release`

## Daily routine

1. Choose only work that can be completed that day.
2. Create a short-lived branch for each coherent change.
3. Run `npm test` and `npm run build` before committing.
4. Use the suggested message or another truthful, natural description.
5. Push and merge only when the change is reviewable and checks pass.

The scheduled GitHub Actions workflow validates repository health at 09:00 IST during this seven-day window. It never creates empty commits, changes timestamps, or modifies the contribution graph.
