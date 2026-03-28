-- Migration: Fix default legal_limit from 221 to 225
-- The legal limit for maximum working days per year should be 225, not 221.

-- Update the default value for new rows
ALTER TABLE contract_details 
  ALTER COLUMN legal_limit SET DEFAULT 225;

-- Also ensure holiday_limit default is 13 (it should already be, but let's be explicit)
ALTER TABLE contract_details 
  ALTER COLUMN holiday_limit SET DEFAULT 13;

-- Fix any existing rows that still have the old incorrect default of 221
UPDATE contract_details 
  SET legal_limit = 225 
  WHERE legal_limit = 221;
