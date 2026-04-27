ALTER TABLE public.contract_details 
ADD COLUMN IF NOT EXISTS holiday_plus_amount numeric DEFAULT 20;
