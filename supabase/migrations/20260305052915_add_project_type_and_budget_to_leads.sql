/*
  # Update leads table for consulting inquiries
  
  1. Changes
    - Add `project_type` column to store the type of project (SaaS Design, E-commerce, etc.)
    - Add `budget_range` column to store the client's budget range
    
  2. Notes
    - Using existing `leads` table as it already has the necessary structure
    - `project_type` will store values like: 'SaaS Design', 'E-commerce', 'Brand Identity', 'Custom Development'
    - `budget_range` will store values like: '5k-10k', '10k-25k', '25k-50k', '50k+'
*/

-- Add project_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'project_type'
  ) THEN
    ALTER TABLE leads ADD COLUMN project_type text;
  END IF;
END $$;

-- Add budget_range column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'budget_range'
  ) THEN
    ALTER TABLE leads ADD COLUMN budget_range text;
  END IF;
END $$;