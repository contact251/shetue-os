import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Calendar as CalendarIcon, 
  Search, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  XCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase, LaborAttendance, Project, Contractor } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const LaborLog: React.FC = () => {
  const [attendance, setAttendance] = useState<LaborAttendance[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedProject, setSelectedProject] = useState<string>('all');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    worker_name: '',
    role: 'Mason',
    wage: 800,
    project_id: '',
    contractor_id: '',
    status: 'present' as const
  });

  const fetchData = async () => {
    try {
      const { data: projectsData } = await supabase.from('projects').select('*');
      const { data: contractorsData } = await supabase.from('contractors').select('*');
      
      let query = supabase.from('labor_attendance').select('*').eq('created_at', selectedDate);
      if (selectedProject !== 'all') {
        query = query.eq('project_id', selectedProject);
      }
      const { data: attendanceData } = await query;

      if (projectsData) setProjects(projectsData);
      if (contractorsData) setContractors(contractorsData);
      if (attendanceData) setAttendance(attendanceData);
    } catch (error) {
      console.error('Error fetching labor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedProject]);

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id || !formData.worker_name) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('labor_attendance')
        .insert([{
          ...formData,
          created_at: selectedDate,
          contractor_id: formData.contractor_id === 'none' || !formData.contractor_id ? null : formData.contractor_id
        }]);

      if (error) throw error;

      setIsDialogOpen(false);
      setFormData({
        worker_name: '',
        role: 'Mason',
        wage: 800,
        project_id: '',
        contractor_id: '',
        status: 'present'
      });
      fetchData();
    } catch (error) {
      console.error('Error adding attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, newStatus: LaborAttendance['status']) => {
    try {
      const { error } = await supabase
        .from('labor_attendance')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const totalDailyWage = attendance.reduce((sum, record) => {
    const multiplier = record.status === 'present' ? 1 : record.status === 'half-day' ? 0.5 : 0;
    return sum + (Number(record.wage) * multiplier);
  }, 0);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Labor Log (Hazira)</h1>
          <p className="text-zinc-500">Manage daily attendance and wage calculations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-44 border-zinc-200 bg-white"
          />
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Worker
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">Total Workers</p>
              <h3 className="text-2xl font-bold text-zinc-900">{attendance.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">Present</p>
              <h3 className="text-2xl font-bold text-zinc-900">
                {attendance.filter(a => a.status === 'present').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">Half-Day</p>
              <h3 className="text-2xl font-bold text-zinc-900">
                {attendance.filter(a => a.status === 'half-day').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">Daily Wage Total</p>
              <h3 className="text-2xl font-bold text-zinc-900">৳ {totalDailyWage.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[250px] bg-white border-zinc-200">
            <SelectValue placeholder="Filter by Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Attendance Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="hover:bg-transparent border-zinc-100">
              <TableHead className="font-semibold text-zinc-900">Worker Name</TableHead>
              <TableHead className="font-semibold text-zinc-900">Role</TableHead>
              <TableHead className="font-semibold text-zinc-900">Project</TableHead>
              <TableHead className="font-semibold text-zinc-900">Wage</TableHead>
              <TableHead className="font-semibold text-zinc-900">Status</TableHead>
              <TableHead className="font-semibold text-zinc-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                  No attendance records for this date.
                </TableCell>
              </TableRow>
            ) : (
              attendance.map((record) => (
                <TableRow key={record.id} className="hover:bg-zinc-50/50 border-zinc-100 transition-colors">
                  <TableCell className="font-medium text-zinc-900">{record.worker_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-zinc-500 border-zinc-200">
                      {record.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    {projects.find(p => p.id === record.project_id)?.name || 'Unknown'}
                  </TableCell>
                  <TableCell className="font-semibold text-zinc-900">৳ {record.wage}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-medium",
                      record.status === 'present' ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-50" :
                      record.status === 'half-day' ? "bg-amber-50 text-amber-600 hover:bg-amber-50" :
                      "bg-rose-50 text-rose-600 hover:bg-rose-50"
                    )}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => updateStatus(record.id, 'present')}
                        className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => updateStatus(record.id, 'half-day')}
                        className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50"
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => updateStatus(record.id, 'absent')}
                        className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Worker Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Add Worker Attendance</DialogTitle>
            <DialogDescription>Log a worker for {format(new Date(selectedDate), 'MMM dd, yyyy')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAttendance} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select 
                value={formData.project_id} 
                onValueChange={(v) => setFormData({...formData, project_id: v})}
              >
                <SelectTrigger className="border-zinc-200">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contractor (Optional)</label>
              <Select 
                value={formData.contractor_id} 
                onValueChange={(v) => setFormData({...formData, contractor_id: v})}
              >
                <SelectTrigger className="border-zinc-200">
                  <SelectValue placeholder="Select a contractor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Direct Labor)</SelectItem>
                  {contractors.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Worker Name</label>
              <Input 
                placeholder="e.g. Abdul Karim" 
                value={formData.worker_name}
                onChange={(e) => setFormData({...formData, worker_name: e.target.value})}
                className="border-zinc-200"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select 
                  value={formData.role} 
                  onValueChange={(v) => setFormData({...formData, role: v})}
                >
                  <SelectTrigger className="border-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mason">Mason</SelectItem>
                    <SelectItem value="Helper">Helper</SelectItem>
                    <SelectItem value="Electrician">Electrician</SelectItem>
                    <SelectItem value="Plumber">Plumber</SelectItem>
                    <SelectItem value="Carpenter">Carpenter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Wage (৳)</label>
                <Input 
                  type="number" 
                  value={formData.wage}
                  onChange={(e) => setFormData({...formData, wage: Number(e.target.value)})}
                  className="border-zinc-200"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Log Attendance
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LaborLog;
