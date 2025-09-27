-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.accounts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  type character varying NOT NULL,
  balance numeric DEFAULT 0,
  currency character varying DEFAULT 'COP'::character varying,
  color character varying DEFAULT '#3B82F6'::character varying,
  icon character varying DEFAULT 'credit-card'::character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT accounts_pkey PRIMARY KEY (id),
  CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  type character varying NOT NULL,
  color character varying DEFAULT '#10B981'::character varying,
  icon character varying DEFAULT 'tag'::character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username character varying,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  preferred_currency character varying DEFAULT 'COP'::character varying,
  language character varying DEFAULT 'es-CO'::character varying,
  timezone character varying DEFAULT 'America/Bogota'::character varying,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  account_id uuid NOT NULL,
  category_id uuid,
  type character varying NOT NULL,
  amount numeric NOT NULL,
  description text,
  notes text,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id),
  CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

-- Default Categories for Colombia
-- These will be inserted for each user when they create their profile

-- Income Categories (Categorías de Ingresos)
INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Salario',
  'income',
  '#10B981',
  'briefcase',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Salario' AND c.type = 'income'
);

INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Freelance',
  'income',
  '#8B5CF6',
  'computer',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Freelance' AND c.type = 'income'
);

INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Inversiones',
  'income',
  '#F59E0B',
  'trending-up',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Inversiones' AND c.type = 'income'
);

INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Regalos',
  'income',
  '#EC4899',
  'gift',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Regalos' AND c.type = 'income'
);

INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Otros Ingresos',
  'income',
  '#6B7280',
  'plus-circle',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Otros Ingresos' AND c.type = 'income'
);

-- Expense Categories (Categorías de Gastos)
INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Alimentación',
  'expense',
  '#EF4444',
  'utensils',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Alimentación' AND c.type = 'expense'
);

INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Transporte',
  'expense',
  '#3B82F6',
  'car',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Transporte' AND c.type = 'expense'
);

INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Vivienda',
  'expense',
  '#059669',
  'home',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Vivienda' AND c.type = 'expense'
);

INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Salud',
  'expense',
  '#DC2626',
  'heart',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Salud' AND c.type = 'expense'
);

INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Educación',
  'expense',
  '#7C3AED',
  'book-open',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Educación' AND c.type = 'expense'
);

INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Entretenimiento',
  'expense',
  '#F97316',
  'film',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Entretenimiento' AND c.type = 'expense'
);

INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Compras',
  'expense',
  '#06B6D4',
  'shopping-bag',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Compras' AND c.type = 'expense'
);

INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Servicios',
  'expense',
  '#84CC16',
  'wifi',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Servicios' AND c.type = 'expense'
);

INSERT INTO public.categories (id, user_id, name, type, color, icon, is_active)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Otros Gastos',
  'expense',
  '#6B7280',
  'dots-horizontal',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = 'Otros Gastos' AND c.type = 'expense'
);