-- ====================================================================================
-- SUPABASE SCHEMA - WORK LIFE OS
-- Instrucciones: 
-- 1. Ve a tu proyecto de Supabase en supabase.com
-- 2. Abre el "SQL Editor" (icono de código en el menú lateral)
-- 3. Pega todo este código y dale a "Run"
-- ====================================================================================

-- 1. EXTENSIÓN NECESARIA PARA GENERAR IDS ÚNICOS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES DE TRABAJO (ROLES)
CREATE TABLE public.shift_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rate NUMERIC(10, 2) NOT NULL DEFAULT 0,
    position_plus NUMERIC(10, 2) NOT NULL DEFAULT 0,
    color TEXT NOT NULL DEFAULT '#000000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE REGISTROS DIARIOS (DÍAS TRABAJADOS/LIBRES)
CREATE TABLE public.work_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type TEXT CHECK (type IN ('worked', 'off', 'holiday')) NOT NULL,
    profile_id UUID REFERENCES public.shift_profiles(id) ON DELETE SET NULL,
    notes TEXT,
    is_worked_holiday BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date) -- Un usuario solo puede tener un registro por día
);

-- 4. TABLA DE CONFIGURACIÓN DEL CONTRATO
CREATE TABLE public.contract_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    base_salary NUMERIC(10, 2) NOT NULL DEFAULT 1200.00,
    seniority NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    post_holiday_plus NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    transport_plus NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    clothing_plus NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    social_security_rate NUMERIC(5, 2) NOT NULL DEFAULT 6.35,
    legal_limit INTEGER NOT NULL DEFAULT 221,
    holiday_limit INTEGER NOT NULL DEFAULT 14,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================================
-- ROW LEVEL SECURITY (RLS) - SEGURIDAD PARA MULTIUSUARIO
-- Esto asegura que Juan no pueda ver los datos de María.
-- ====================================================================================

ALTER TABLE public.shift_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_details ENABLE ROW LEVEL SECURITY;

-- Políticas para Shift Profiles
CREATE POLICY "Users can view their own profiles" ON public.shift_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profiles" ON public.shift_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profiles" ON public.shift_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profiles" ON public.shift_profiles FOR DELETE USING (auth.uid() = user_id);

-- Políticas para Work Logs
CREATE POLICY "Users can view their own logs" ON public.work_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own logs" ON public.work_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own logs" ON public.work_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own logs" ON public.work_logs FOR DELETE USING (auth.uid() = user_id);

-- Políticas para Contract Details
CREATE POLICY "Users can view their own contract" ON public.contract_details FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own contract" ON public.contract_details FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contract" ON public.contract_details FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contract" ON public.contract_details FOR DELETE USING (auth.uid() = user_id);

-- Trigger para crear Contract Details por defecto al registrar un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.contract_details (user_id) VALUES (new.id);
  
  -- Insertamos perfiles por defecto para el nuevo usuario
  INSERT INTO public.shift_profiles (user_id, name, rate, position_plus, color)
  VALUES 
    (new.id, 'Turno Mañana', 80, 10, 'var(--color-mint-green)'),
    (new.id, 'Turno Noche', 110, 15, 'var(--color-royal-purple)'),
    (new.id, 'Festivo Especial', 150, 20, 'var(--color-vibrant-red)');
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
