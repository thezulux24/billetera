-- Base de datos para app de finanzas personales
-- Ejecutar este SQL en el Editor SQL de Supabase

-- 1. Extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50),
    full_name TEXT,
    avatar_url TEXT,
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    language VARCHAR(5) DEFAULT 'es-ES',
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de cuentas (banco, efectivo, tarjetas, etc.)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'bank', 'cash', 'credit_card', 'debit_card', 'savings'
    balance DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    color VARCHAR(7) DEFAULT '#3B82F6', -- Color hex para la UI
    icon VARCHAR(50) DEFAULT 'credit-card', -- Icono para la UI
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'income' o 'expense'
    color VARCHAR(7) DEFAULT '#10B981',
    icon VARCHAR(50) DEFAULT 'tag',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de transacciones
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL, -- 'income' o 'expense'
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    notes TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    
    -- Crear categorías por defecto
    INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
    (NEW.id, 'Salario', 'income', '#10B981', 'banknotes'),
    (NEW.id, 'Freelance', 'income', '#059669', 'briefcase'),
    (NEW.id, 'Inversiones', 'income', '#047857', 'chart-bar'),
    (NEW.id, 'Otros Ingresos', 'income', '#065F46', 'plus-circle'),
    (NEW.id, 'Alimentación', 'expense', '#EF4444', 'shopping-cart'),
    (NEW.id, 'Transporte', 'expense', '#F97316', 'truck'),
    (NEW.id, 'Vivienda', 'expense', '#8B5CF6', 'home'),
    (NEW.id, 'Entretenimiento', 'expense', '#EC4899', 'film'),
    (NEW.id, 'Salud', 'expense', '#06B6D4', 'heart'),
    (NEW.id, 'Educación', 'expense', '#84CC16', 'academic-cap'),
    (NEW.id, 'Ropa', 'expense', '#F59E0B', 'shopping-bag'),
    (NEW.id, 'Otros Gastos', 'expense', '#6B7280', 'dots-horizontal');
    
    -- Crear cuenta por defecto
    INSERT INTO public.accounts (user_id, name, type, balance, color, icon) VALUES
    (NEW.id, 'Efectivo', 'cash', 0, '#10B981', 'cash'),
    (NEW.id, 'Cuenta Corriente', 'bank', 0, '#3B82F6', 'credit-card');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 11. Políticas de seguridad
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- 12. Función para actualizar balance de cuenta cuando se crea/actualiza/elimina transacción
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Si es INSERT o UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Si es UPDATE, primero revertir la transacción anterior
        IF TG_OP = 'UPDATE' AND OLD.account_id IS NOT NULL THEN
            IF OLD.type = 'income' THEN
                UPDATE public.accounts 
                SET balance = balance - OLD.amount 
                WHERE id = OLD.account_id;
            ELSE
                UPDATE public.accounts 
                SET balance = balance + OLD.amount 
                WHERE id = OLD.account_id;
            END IF;
        END IF;
        
        -- Aplicar nueva transacción
        IF NEW.type = 'income' THEN
            UPDATE public.accounts 
            SET balance = balance + NEW.amount 
            WHERE id = NEW.account_id;
        ELSE
            UPDATE public.accounts 
            SET balance = balance - NEW.amount 
            WHERE id = NEW.account_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Si es DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.type = 'income' THEN
            UPDATE public.accounts 
            SET balance = balance - OLD.amount 
            WHERE id = OLD.account_id;
        ELSE
            UPDATE public.accounts 
            SET balance = balance + OLD.amount 
            WHERE id = OLD.account_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 13. Trigger para actualizar balance automáticamente
CREATE TRIGGER update_account_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- 14. Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);