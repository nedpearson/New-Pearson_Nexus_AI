/*
  # Add File Storage Columns to Documents

  1. New Columns
    - Add `file_path` to documents table to store Supabase Storage path
    - Add `file_name` to documents table to store original filename
    - Add `file_size` to documents table to store file size in bytes
    - Add `file_type` to documents table to store MIME type
    
  2. Notes
    - Storage bucket 'documents' should be created via Supabase dashboard
    - RLS policies for storage.objects should be configured via dashboard
    
  3. Security
    - File metadata is stored in documents table with existing RLS
    - Actual files stored in Supabase Storage with bucket-level RLS
*/

-- Add file storage columns to documents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'file_path'
  ) THEN
    ALTER TABLE public.documents 
    ADD COLUMN file_path text,
    ADD COLUMN file_name text,
    ADD COLUMN file_size bigint,
    ADD COLUMN file_type text;
  END IF;
END $$;

-- Add index for file path lookups
CREATE INDEX IF NOT EXISTS idx_documents_file_path 
ON public.documents(file_path) 
WHERE file_path IS NOT NULL;