# Architecture

The React client presents the investigation as evidence, timeline, hypotheses, correlations, and safe agent replay. The Express API owns incident state, upload boundaries, SSE progress, feedback, and analysis modules. `server/engine.ts` holds pure deterministic timestamp, anomaly, retrieval, timeline, and confidence functions, keeping arithmetic out of the model layer.

Core entities are incidents, evidence, timeline events, hypotheses, recommendations, and trace events. Evidence payloads remain outside incident records; production storage maps these entities to relational tables and blobs to object storage.
