-- Añadir columnas para horas extras en work_logs
ALTER TABLE public.work_logs 
ADD COLUMN IF NOT EXISTS extra_hours NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_hours_rate NUMERIC DEFAULT 0;

-- Comentarios para documentación
COMMENT ON COLUMN public.work_logs.extra_hours IS 'Número de horas extras realizadas en el día';
COMMENT ON COLUMN public.work_logs.extra_hours_rate IS 'Precio por hora extra aplicada';
