-- Migration: Add missing salary pluses to contract_details
-- Created: 2026-04-27 19:20

ALTER TABLE public.contract_details 
ADD COLUMN IF NOT EXISTS toxic_plus NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS convenio_plus NUMERIC DEFAULT 0;
