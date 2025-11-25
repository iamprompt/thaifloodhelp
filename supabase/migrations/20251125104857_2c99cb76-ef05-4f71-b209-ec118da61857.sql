-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to reports table (1536 dimensions for OpenAI embeddings)
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for faster similarity search
CREATE INDEX IF NOT EXISTS reports_embedding_idx 
ON public.reports 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to find similar reports based on embedding similarity
CREATE OR REPLACE FUNCTION public.find_similar_reports(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.85,
  match_limit int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  phone text[],
  raw_message text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.address,
    r.phone,
    r.raw_message,
    1 - (r.embedding <=> query_embedding) as similarity
  FROM public.reports r
  WHERE r.embedding IS NOT NULL
    AND 1 - (r.embedding <=> query_embedding) >= similarity_threshold
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_limit;
END;
$$;