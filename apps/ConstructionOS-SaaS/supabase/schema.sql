-- CONSTRUCTION OS: DATABASE SCHEMA (SUPABASE/POSTGRES)

-- 1. Profiles (Linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'engineer' CHECK (role IN ('admin', 'engineer', 'contractor')),
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Projects
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  client_name TEXT,
  budget BDT NUMERIC DEFAULT 0,
  start_date DATE,
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID REFERENCES profiles(id)
);

-- 3. Contractors
CREATE TABLE contractors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  phone TEXT,
  trade TEXT CHECK (trade IN ('Civil', 'Electrical', 'Plumbing', 'Painting', 'Interior')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tasks (The WBS Engine)
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('Civil', 'MEP', 'Finishing', 'External')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'done', 'blocked')),
  weightage NUMERIC DEFAULT 1, -- For progress % calculation
  contractor_id UUID REFERENCES contractors(id),
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Cost Items (Quantity & Pricing)
CREATE TABLE cost_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_cost NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Checklists (The Trello-style component)
CREATE TABLE checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEED DATA (Based on Shetue Tech/Duplex Data)
-- Insert a test project
INSERT INTO projects (name, location, client_name, budget)
VALUES ('Shetue Duplex House', 'Kismotpur, Chowmuhni, Noakhali', 'Md Jahirul Huq', 15000000);

-- Insert contractors
INSERT INTO contractors (company_name, trade) VALUES ('Zoha Electricals', 'Electrical');
INSERT INTO contractors (company_name, trade) VALUES ('Shetue Tech Painting', 'Painting');
