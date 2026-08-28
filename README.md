<!--
  Archivo: README.md en la raíz de nesta-gemini (ahora mismo está vacío).
  Escrito solo con lo que se verifica en el repo. Las secciones marcadas
  {{ }} necesitan datos que están en Cloud Run / Grafana, no en el código:
  rellénalas cuando los tengas o borra la fila. Nunca las estimes.
-->
 
# Nesta — RAG career companion
 
Conversational assistant that answers career questions grounded in conference content and
a curated corpus of labour-market research. Built for Her Career Conference 2026
(District3, Montréal) and deployed in production during the event.
 
---
 
## The problem
 
Conference attendees get a program, a speaker list, and a pile of reports nobody reads.
The useful question is not "what's the schedule" but "given what I do, which session and
which research matter to me?" — a retrieval problem over heterogeneous sources, under a
hard deadline and a fixed budget, with a public audience and no room to hallucinate.
 
## Architecture
 
Request path:
 
```
user query
  → intent classifier      → is this in scope? which mode?
  → query router           → conference content vs. research corpus
  → retriever (pgvector)   → semantic search over chunked sources
  → reranker               → relevance ordering before the context window
  → PII anonymizer         → strips personal data before the model call
  → guardrails + hard limits
  → Claude (generation), streamed to the client
  → cache layer (Redis)    → keyed on the message, error responses excluded
```
 
Embeddings run on Gemini, generation on Claude, retrieval on Supabase/pgvector,
caching on Redis, frontend on Firebase, backend containerized for Cloud Run.
 
## Decisions and trade-offs
 
| Decision | Why | Trade-off |
|---|---|---|
| Gemini for embeddings, Claude for generation | embedding cost per query is negligible on Gemini; generation quality matters more than its price | two providers to monitor and two failure modes |
| Supabase/pgvector instead of a dedicated vector DB | one less service to run; row-level security available | index tuning is manual |
| Redis cache keyed on the raw message | conference traffic is highly repetitive — the same questions arrive in bursts | no semantic matching: near-identical phrasings miss |
| Error responses excluded from the cache | caching a transient failure serves that failure for the whole TTL | pattern list needs maintenance as failure text changes |
 
## Cost accounting
 
Cost is computed per call from real token counts rather than estimated after the fact:
input and output tokens priced at call time, embedding cost added per query, and savings
from cache hits tracked alongside spend.
 
Note: the running total lives in process memory, so it resets on restart. Aggregate
figures for the event come from Cloud Run logs, not from this repo.
 
## Testing
 
16 test files, split by level:
 
- **unit** — chunker, classifier, router, reranker, anonymiser, guardrails, hard limits, cache, modes
- **integration** — Supabase read and write, PDF processing, the Nesta endpoint
- **end-to-end** — routing, stress, and the test harness
```bash
cd backend && pytest tests/unit -q
```
 
## Knowledge base
 
Two sources, chunked and embedded:
 
- **Conference content** — sessions, speakers, workshops
- **Research corpus** — public reports on labour markets and AI, including WEF Future of
  Jobs 2025, WEF Putting Skills First, McKinsey's superagency reports, and Quebec
  employment and language studies. Raw PDFs and their processed chunks are both tracked.
## Run it
 
```bash
git clone https://github.com/FlorCampos/{{repo}} && cd {{repo}}
cp backend/.env.example backend/.env    # fill in your keys
docker compose up
```
 
## Known limitations
 
- Cache matching is exact, not semantic — paraphrased questions miss.
- Cost totals are in-memory and reset on restart; there is no persisted spend history.
- The error-pattern list that keeps failures out of the cache is hand-maintained.
- {{añade lo que sepas que falta — esta sección es la que más confianza genera}}
## Roadmap
 
- {{tres puntos, con fecha}}
 