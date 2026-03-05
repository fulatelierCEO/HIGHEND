/*
  # Add Project Type and Budget Range to Consulting Inquiries

  1. Changes
    - Add `project_type` column to store the type of project (e.g., "Brand Identity", "Web Design")
    - Add `budget_range` column to store the client's budget range
  
  2. Notes
    - Uses IF NOT EXISTS to safely add columns if they don't already exist
    - These fields will be populated from the inquiry form submission
*/

ALTER TABLE consulting_inquiries 
ADD COLUMN IF NOT EXISTS project_type text,
ADD COLUMN IF NOT EXISTS budget_range text;