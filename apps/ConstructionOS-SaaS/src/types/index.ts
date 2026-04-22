// CONSTRUCTION OS: TYPES
export type ProjectStatus = 'active' | 'completed' | 'on-hold';
export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'blocked';
export type UserRole = 'admin' | 'engineer' | 'contractor';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  client_name: string;
  budget: number;
  start_date: string;
  deadline: string;
  status: ProjectStatus;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  category: 'Civil' | 'MEP' | 'Finishing' | 'External';
  status: TaskStatus;
  weightage: number;
  contractor_id?: string;
  deadline?: string;
}

export interface CostItem {
  id: string;
  task_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
}

export interface ChecklistItem {
  id: string;
  task_id: string;
  item: string;
  is_completed: boolean;
}

export interface Contractor {
  id: string;
  company_name: string;
  phone: string;
  trade: string;
}
