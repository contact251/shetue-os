import { supabase } from '../lib/supabase';

export const projectService = {
  async getAllProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getProjectCosts() {
    const { data, error } = await supabase
      .from('project_costs')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async getProjectStats() {
    try {
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      
      const { data: costsData } = await this.getProjectCosts();
      
      const totalLiability = costsData?.reduce((sum, p) => sum + Number(p.grand_total), 0) || 0;
      const totalPaid = costsData?.reduce((sum, p) => sum + Number(p.total_paid), 0) || 0;
      
      return {
        activeProjects: projectCount || 0,
        totalLiability,
        totalPaid,
      };
    } catch (error) {
      console.error('Error in getProjectStats:', error);
      return { activeProjects: 0, totalLiability: 0, totalPaid: 0 };
    }
  }
};
