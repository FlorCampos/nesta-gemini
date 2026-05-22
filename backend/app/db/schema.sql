-- ============================================
-- Nesta AI — Database Schema
-- Run in Supabase SQL Editor to create all tables
-- ============================================

-- 1. Knowledge base chunks (vector search)
CREATE TABLE IF NOT EXISTS kb_chunks (
    id BIGSERIAL PRIMARY KEY,
    content TEXT,
    source VARCHAR(255),
    page INTEGER DEFAULT 0,
    type VARCHAR(50) DEFAULT 'text',
    embedding VECTOR(3072)
);

-- 2. Anonymised insights (user questions)
CREATE TABLE IF NOT EXISTS insights (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    theme VARCHAR(100),
    sub_theme VARCHAR(100),
    anon_question TEXT,
    consent_given BOOLEAN DEFAULT FALSE,
    mode VARCHAR(50)
);

-- 3. Conference sessions and workshops
CREATE TABLE IF NOT EXISTS conference (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255),
    speaker VARCHAR(255),
    date_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    location VARCHAR(255),
    description TEXT,
    session_type VARCHAR(50),
    topics TEXT[]
);

-- 4. Cost tracking
CREATE TABLE IF NOT EXISTS cost_tracking (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    message_hash VARCHAR(20),
    cached BOOLEAN DEFAULT FALSE,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    cost_usd DECIMAL(10,6) DEFAULT 0,
    saved_usd DECIMAL(10,6) DEFAULT 0,
    provider VARCHAR(50) DEFAULT 'claude-opus-4-6',
    embedding_cost DECIMAL(10,8) DEFAULT 0,
    embedding_provider VARCHAR(50) DEFAULT 'gemini-embedding-2'
);

-- 5. Vector search function
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(3072),
    match_threshold FLOAT DEFAULT 0.3,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id BIGINT,
    content TEXT,
    source VARCHAR(255),
    page INTEGER,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kb_chunks.id,
        kb_chunks.content,
        kb_chunks.source,
        kb_chunks.page,
        1 - (kb_chunks.embedding <=> query_embedding) AS similarity
    FROM kb_chunks
    WHERE 1 - (kb_chunks.embedding <=> query_embedding) > match_threshold
    ORDER BY kb_chunks.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 6. Views
CREATE OR REPLACE VIEW nesta_activity AS
SELECT 
    TO_CHAR(c.created_at AT TIME ZONE 'America/Montreal', 'Mon DD, YYYY HH12:MI AM') AS created,
    i.anon_question,
    c.input_tokens,
    c.output_tokens,
    c.cost_usd,
    c.embedding_cost,
    c.cached
FROM cost_tracking c
LEFT JOIN LATERAL (
    SELECT anon_question, created_at
    FROM insights
    WHERE ABS(EXTRACT(EPOCH FROM (insights.created_at - c.created_at))) < 10
    ORDER BY ABS(EXTRACT(EPOCH FROM (insights.created_at - c.created_at)))
    LIMIT 1
) i ON true
ORDER BY c.created_at DESC;

CREATE OR REPLACE VIEW nesta_insights AS
SELECT 
    TO_CHAR(created_at AT TIME ZONE 'America/Montreal', 'Mon DD, YYYY HH12:MI AM') AS created,
    anon_question,
    theme,
    mode
FROM insights
ORDER BY created_at DESC;