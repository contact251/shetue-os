import { supabase } from '../lib/supabase';

export interface CreateTaskDTO {
  project_id: string;
  title: string;
  quantity: number;
  unit_price: number;
}

export const taskService = {
  async getTasks(projectId?: string) {
    let query = supabase.from('tasks').select('*');
    
    if (projectId && projectId !== 'all') {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createTask(task: CreateTaskDTO) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async toggleTaskStatus(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === 'pending' ? 'done' : 'pending';
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);
    
    if (error) throw error;
    return newStatus;
  },

  async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) throw error;
    return true;
  }
};
