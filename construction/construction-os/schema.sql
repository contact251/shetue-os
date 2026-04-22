-- ==============================
-- EXTENSIONS
-- ==============================
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ==============================
-- PROFILES
-- ==============================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text default 'owner',
  created_at timestamp with time zone default now()
);

-- ==============================
-- CONTRACTORS
-- ==============================
create table if not exists public.contractors (
  id uuid primary key default gen_random_uuid(),
  name text,
  specialty text,
  phone text,
  email text,
  owner_id uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

-- ==============================
-- PROJECTS
-- ==============================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text,
  location text,
  owner_id uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

-- ==============================
-- TASKS
-- ==============================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  assigned_to uuid references public.profiles(id),
  title text,
  status text default 'pending',
  quantity numeric,
  unit_price numeric,
  total_price numeric generated always as (quantity * unit_price) stored,
  created_at timestamp with time zone default now()
);

-- ==============================
-- INVENTORY
-- ==============================
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  material_name text,
  unit text,
  current_stock numeric default 0,
  min_stock numeric default 0,
  unit_price numeric default 0,
  created_at timestamp with time zone default now()
);

-- ==============================
-- INVENTORY LOGS
-- ==============================
create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid references public.inventory(id) on delete cascade,
  type text,
  quantity numeric,
  note text,
  created_at timestamp with time zone default now()
);

-- ==============================
-- LABOR
-- ==============================
create table if not exists public.labor_attendance (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  contractor_id uuid references public.contractors(id) on delete set null,
  worker_name text,
  role text,
  status text,
  wage numeric,
  payment_id uuid references public.payments(id) on delete set null,
  created_at date default current_date
);

-- ==============================
-- PHOTOS
-- ==============================
create table if not exists public.project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  image_url text,
  category text,
  caption text,
  created_at timestamp with time zone default now()
);

-- ==============================
-- PAYMENTS
-- ==============================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  contractor_id uuid references public.contractors(id) on delete set null,
  amount numeric not null,
  payment_method text, -- bKash, Nagad, Rocket, Cash
  reference text,
  status text default 'completed',
  created_at timestamp with time zone default now()
);

-- ==============================
-- ENABLE RLS
-- ==============================
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_logs enable row level security;
alter table public.labor_attendance enable row level security;
alter table public.project_photos enable row level security;
alter table public.contractors enable row level security;
alter table public.payments enable row level security;

-- ==============================
-- VIEWS
-- ==============================
create or replace view public.project_costs as
select 
  p.id,
  p.name,
  -- Material Cost
  coalesce(sum(i.current_stock * i.unit_price), 0) as material_cost,
  -- Task Cost
  coalesce(sum(t.total_price), 0) as task_cost,
  -- Labor Cost (Accrued)
  coalesce(sum(l.wage), 0) as labor_cost,
  -- Paid Labor Cost
  (select coalesce(sum(wage), 0) from public.labor_attendance la where la.project_id = p.id and la.payment_id is not null) as paid_labor_cost,
  -- Actual Payments Made (Total)
  (select coalesce(sum(amount), 0) from public.payments pay where pay.project_id = p.id) as total_paid,
  -- Grand Total (Estimated Liability)
  (coalesce(sum(i.current_stock * i.unit_price), 0) + coalesce(sum(t.total_price), 0) + coalesce(sum(l.wage), 0)) as grand_total
from public.projects p
left join public.tasks t on t.project_id = p.id
left join public.inventory i on i.project_id = p.id
left join public.labor_attendance l on l.project_id = p.id
group by p.id, p.name;

-- ==============================
-- RLS POLICIES
-- ==============================

-- PAYMENTS
create policy "payments_access"
on public.payments
for all
using (
  auth.uid() IN (
    select owner_id from public.projects p where p.id = payments.project_id
  )
)
with check (
  auth.uid() IN (
    select owner_id from public.projects p where p.id = payments.project_id
  )
);

-- CONTRACTORS
create policy "contractors_owner_only"
on public.contractors
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

-- PROJECTS
create policy "projects_owner_only"
on public.projects
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

-- TASKS
create policy "tasks_access"
on public.tasks
for all
using (
  auth.uid() = assigned_to
  OR auth.uid() IN (
    select owner_id from public.projects p where p.id = tasks.project_id
  )
)
with check (
  auth.uid() = assigned_to
  OR auth.uid() IN (
    select owner_id from public.projects p where p.id = tasks.project_id
  )
);

-- INVENTORY
create policy "inventory_access"
on public.inventory
for all
using (
  auth.uid() IN (
    select owner_id from public.projects p where p.id = inventory.project_id
  )
)
with check (
  auth.uid() IN (
    select owner_id from public.projects p where p.id = inventory.project_id
  )
);

-- INVENTORY LOGS
create policy "inventory_logs_access"
on public.inventory_logs
for all
using (
  auth.uid() IN (
    select owner_id
    from public.projects p
    join public.inventory i on i.project_id = p.id
    where i.id = inventory_logs.inventory_id
  )
)
with check (
  auth.uid() IN (
    select owner_id
    from public.projects p
    join public.inventory i on i.project_id = p.id
    where i.id = inventory_logs.inventory_id
  )
);

-- LABOR
create policy "labor_access"
on public.labor_attendance
for all
using (
  auth.uid() IN (
    select owner_id from public.projects p where p.id = labor_attendance.project_id
  )
)
with check (
  auth.uid() IN (
    select owner_id from public.projects p where p.id = labor_attendance.project_id
  )
);

-- PHOTOS
create policy "photos_access"
on public.project_photos
for all
using (
  auth.uid() IN (
    select owner_id from public.projects p where p.id = project_photos.project_id
  )
)
with check (
  auth.uid() IN (
    select owner_id from public.projects p where p.id = project_photos.project_id
  )
);
-- ==============================
-- SEED DATA (SHETUE DUPLEX)
-- ==============================

-- 1. Insert Profile (Internal Lead)
INSERT INTO public.profiles (id, name, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'Jahirul Huq', 'admin')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Contractors
INSERT INTO public.contractors (id, name, specialty, phone)
VALUES 
  (gen_random_uuid(), 'Zoha Electrical Services', 'Electrical', '01711223344'),
  (gen_random_uuid(), 'Moderne Painters Ltd', 'Painting', '01855667788')
ON CONFLICT DO NOTHING;

-- 3. Insert Shetue Duplex Project
INSERT INTO public.projects (id, name, location, owner_id)
VALUES (
  'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 
  'Shetue Duplex House', 
  'Maijdi, Noakhali', 
  '00000000-0000-0000-0000-000000000000'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Inventory Items (Based on 2026 Market Report)
INSERT INTO public.inventory (project_id, material_name, unit, current_stock, min_stock, unit_price)
VALUES 
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'Cable 1.3rm BYA-FR (Bizli)', 'Coil', 10, 2, 3640.95),
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'Cable 1.3rm BYA (BBS)', 'Coil', 5, 2, 1515.00),
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'Cable 2.5rm BYA (BRB)', 'Coil', 15, 5, 4726.00),
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'Cable 4.0rm BYA-FR (Bizli)', 'Coil', 8, 2, 10370.40),
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'Modular Switch 1-Gang (Super Star)', 'Pc', 50, 10, 285.00)
ON CONFLICT DO NOTHING;

-- 5. Insert Tasks (The Electrical Checklist)
INSERT INTO public.tasks (project_id, title, status, quantity, unit_price)
VALUES 
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'Main Switchboard Installation', 'done', 1, 45000),
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'Conduit Pipe Laying - Ground Floor', 'pending', 450, 85),
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'Internal Plastering & Prep', 'done', 1, 65000),
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'Base Coat / Primer Painting', 'pending', 5400, 12)
ON CONFLICT DO NOTHING;
