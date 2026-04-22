import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  MoreVertical, 
  ExternalLink,
  Building2,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Project, supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const mockProjects: Project[] = [
    {
      id: 'p1',
      name: 'Gulshan Residential Complex',
      location: 'Gulshan 2, Dhaka',
      owner_id: 'u1',
      created_at: new Date().toISOString()
    },
    {
      id: 'p2',
      name: 'Banani Commercial Tower',
      location: 'Banani, Dhaka',
      owner_id: 'u1',
      created_at: new Date().toISOString()
    },
    {
      id: 'p3',
      name: 'Uttara Apartment Project',
      location: 'Sector 10, Uttara, Dhaka',
      owner_id: 'u1',
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setProjects(data);
        } else {
          // If no data in DB, show mock data for demo purposes
          setProjects(mockProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Projects</h1>
          <p className="text-zinc-500">Manage and track all your ongoing construction sites.</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-lg shadow-orange-500/20">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="group border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
            <div className="h-2 bg-orange-500" />
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-orange-50 transition-colors">
                  <Building2 className="w-5 h-5 text-zinc-600 group-hover:text-orange-600" />
                </div>
              </div>
              <CardTitle className="text-xl mt-4 group-hover:text-orange-600 transition-colors">
                {project.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                <MapPin className="w-3 h-3" />
                {project.location}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-400">Overall Progress</span>
                  <span className="text-zinc-900">65%</span>
                </div>
                <Progress value={65} className="h-1.5 bg-zinc-100" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>24 Tasks Done</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>12 Pending</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-zinc-50 bg-zinc-50/50">
              <Button variant="ghost" className="w-full text-zinc-600 hover:text-orange-600 hover:bg-orange-50 gap-2">
                View Details
                <ExternalLink className="w-3 h-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
