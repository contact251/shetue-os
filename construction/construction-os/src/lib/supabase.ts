/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string | null;
  role: string;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  location: string | null;
  owner_id: string;
  created_at: string;
};

export type Contractor = {
  id: string;
  name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  project_id: string;
  assigned_to: string | null;
  title: string;
  status: 'pending' | 'done';
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
};

export type InventoryItem = {
  id: string;
  project_id: string;
  material_name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  unit_price: number;
  created_at: string;
};

export type InventoryLog = {
  id: string;
  inventory_id: string;
  type: 'in' | 'out';
  quantity: number;
  note: string | null;
  created_at: string;
};

export type LaborAttendance = {
  id: string;
  project_id: string;
  contractor_id: string | null;
  worker_name: string;
  role: string;
  status: string;
  wage: number;
  payment_id: string | null;
  created_at: string;
};

export type ProjectPhoto = {
  id: string;
  project_id: string;
  image_url: string;
  category: string;
  caption: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  project_id: string;
  contractor_id: string | null;
  amount: number;
  payment_method: string;
  reference: string | null;
  status: string;
  created_at: string;
};
