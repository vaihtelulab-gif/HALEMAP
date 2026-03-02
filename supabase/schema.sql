-- Create users table
CREATE TABLE public.users (
  id text PRIMARY KEY, -- Clerk User ID
  email text NOT NULL,
  display_name text,
  created_at timestamptz DEFAULT now()
);

-- Create spots table
CREATE TABLE public.spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  status text NOT NULL CHECK (status IN ('posted', 'vacant')),
  memo text,
  created_by text REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid NOT NULL REFERENCES public.spots(id),
  type text NOT NULL CHECK (type IN ('post', 'remove')),
  photo_url text,
  memo text,
  performed_by text NOT NULL REFERENCES public.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for now, as we control access via Next.js)
CREATE POLICY "Allow all operations for users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for spots" ON public.spots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);
