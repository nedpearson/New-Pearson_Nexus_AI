/*
  # Policy Update Monitor System

  1. New Tables
    - `policy_sources`
      - `id` (uuid, primary key)
      - `name` (text) - Source name
      - `url` (text) - Source URL
      - `category` (text) - e.g., 'federal', 'state', 'local', 'grants'
      - `scan_frequency` (text) - e.g., 'weekly', 'daily'
      - `active` (boolean) - Whether source is actively scanned
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `policy_updates_queue`
      - `id` (uuid, primary key)
      - `source_id` (uuid) - Foreign key to policy_sources
      - `title` (text) - Update title
      - `summary` (text) - Brief summary
      - `published_date` (date) - When policy was published
      - `who_benefits` (text) - Who can benefit
      - `required_actions` (text) - Actions needed
      - `submission_links` (jsonb) - Links for submissions
      - `confidence_score` (numeric) - 0-100 score
      - `needs_human_review` (boolean) - Flag for manual review
      - `review_status` (text) - 'pending', 'approved', 'rejected'
      - `reviewed_by` (uuid) - User who reviewed
      - `reviewed_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `published_policy_updates`
      - `id` (uuid, primary key)
      - `queue_id` (uuid) - Foreign key to policy_updates_queue
      - `title` (text)
      - `summary` (text)
      - `source_name` (text)
      - `source_url` (text)
      - `published_date` (date)
      - `who_benefits` (text)
      - `required_actions` (text)
      - `submission_links` (jsonb)
      - `target_audience` (jsonb) - Personalization criteria
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admin can manage sources and review queue
    - Users can read published updates
*/

-- Policy Sources Table
CREATE TABLE IF NOT EXISTS policy_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  category text NOT NULL DEFAULT 'federal',
  scan_frequency text NOT NULL DEFAULT 'weekly',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE policy_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read policy sources"
  ON policy_sources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage policy sources"
  ON policy_sources FOR ALL
  TO authenticated
  USING (auth.jwt()->>'email' = 'nedpearson@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'nedpearson@gmail.com');

-- Policy Updates Queue Table
CREATE TABLE IF NOT EXISTS policy_updates_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES policy_sources(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL,
  published_date date NOT NULL,
  who_benefits text NOT NULL,
  required_actions text NOT NULL,
  submission_links jsonb DEFAULT '[]'::jsonb,
  confidence_score numeric(5,2) DEFAULT 0,
  needs_human_review boolean DEFAULT true,
  review_status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE policy_updates_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all queue items"
  ON policy_updates_queue FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'nedpearson@gmail.com');

CREATE POLICY "Admins can manage queue items"
  ON policy_updates_queue FOR ALL
  TO authenticated
  USING (auth.jwt()->>'email' = 'nedpearson@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'nedpearson@gmail.com');

-- Published Policy Updates Table
CREATE TABLE IF NOT EXISTS published_policy_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid REFERENCES policy_updates_queue(id) ON DELETE SET NULL,
  title text NOT NULL,
  summary text NOT NULL,
  source_name text NOT NULL,
  source_url text NOT NULL,
  published_date date NOT NULL,
  who_benefits text NOT NULL,
  required_actions text NOT NULL,
  submission_links jsonb DEFAULT '[]'::jsonb,
  target_audience jsonb DEFAULT '{}'::jsonb,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE published_policy_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read published updates"
  ON published_policy_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage published updates"
  ON published_policy_updates FOR ALL
  TO authenticated
  USING (auth.jwt()->>'email' = 'nedpearson@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'nedpearson@gmail.com');

-- Insert sample policy sources
INSERT INTO policy_sources (name, url, category, scan_frequency) VALUES
  ('SBA.gov - Small Business Grants', 'https://www.sba.gov/funding-programs/grants', 'federal', 'weekly'),
  ('Grants.gov', 'https://www.grants.gov', 'federal', 'weekly'),
  ('IRS Business Updates', 'https://www.irs.gov/newsroom/small-business-tax-news', 'federal', 'weekly'),
  ('DOL Labor Updates', 'https://www.dol.gov/newsroom', 'federal', 'weekly'),
  ('State Business Portal', 'https://business.ca.gov', 'state', 'weekly')
ON CONFLICT DO NOTHING;

-- Insert sample queue items for demo
INSERT INTO policy_updates_queue (
  source_id,
  title,
  summary,
  published_date,
  who_benefits,
  required_actions,
  submission_links,
  confidence_score,
  needs_human_review,
  review_status
)
SELECT 
  id,
  'Employee Retention Tax Credit Extension',
  'The IRS has extended the Employee Retention Tax Credit (ERTC) for eligible small businesses through Q4 2024. Businesses that retained employees during economic hardship may qualify for up to $26,000 per employee.',
  '2024-03-15'::date,
  'Small businesses (under 500 employees) that experienced revenue decline of 20% or more',
  '1. Calculate eligible quarters 2. Gather payroll records 3. File Form 941-X 4. Submit by September 30, 2024',
  '[{"label": "IRS Form 941-X", "url": "https://www.irs.gov/forms-pubs/about-form-941-x"}, {"label": "ERTC Calculator", "url": "https://www.irs.gov/ertc-calculator"}]'::jsonb,
  85.5,
  true,
  'pending'
FROM policy_sources
WHERE name = 'IRS Business Updates'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO policy_updates_queue (
  source_id,
  title,
  summary,
  published_date,
  who_benefits,
  required_actions,
  submission_links,
  confidence_score,
  needs_human_review,
  review_status
)
SELECT 
  id,
  'SBA 7(a) Loan Program Changes',
  'New SBA 7(a) loan limits increased to $5 million with reduced fees for loans under $500k. Streamlined application process now available for existing borrowers.',
  '2024-03-10'::date,
  'Small businesses seeking growth capital, particularly existing SBA borrowers',
  '1. Review eligibility criteria 2. Prepare financial statements 3. Contact SBA-approved lender 4. Complete application via SBA portal',
  '[{"label": "SBA Lender Match", "url": "https://www.sba.gov/lendermatch"}, {"label": "Application Portal", "url": "https://www.sba.gov/apply"}]'::jsonb,
  92.0,
  false,
  'pending'
FROM policy_sources
WHERE name = 'SBA.gov - Small Business Grants'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO policy_updates_queue (
  source_id,
  title,
  summary,
  published_date,
  who_benefits,
  required_actions,
  submission_links,
  confidence_score,
  needs_human_review,
  review_status
)
SELECT 
  id,
  'New Minimum Wage Requirements - 2024',
  'Federal contractors must now pay minimum wage of $17.20/hour effective January 1, 2025. Applies to new contracts and renewals.',
  '2024-03-01'::date,
  'Businesses with federal contracts',
  '1. Review current wage structure 2. Update payroll systems 3. Notify affected employees 4. Update contract bids',
  '[{"label": "DOL Compliance Guide", "url": "https://www.dol.gov/compliance"}]'::jsonb,
  78.0,
  true,
  'pending'
FROM policy_sources
WHERE name = 'DOL Labor Updates'
LIMIT 1
ON CONFLICT DO NOTHING;
