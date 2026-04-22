import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Circle,
  Calculator,
  FileText,
  Tag,
  Loader2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Task, Project, supabase } from '@/lib/supabase';
import { taskService } from '@/services/taskService';
import { projectService } from '@/services/projectService';
import { cn } from '@/lib/utils';

const Checklist: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    quantity: 0,
    unit_price: 0,
    project_id: '',
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.project_id || !newTask.title) return;

    setIsSubmitting(true);
    try {
      await taskService.createTask(newTask);
      setIsDialogOpen(false);
      setNewTask({
        title: '',
        quantity: 0,
        unit_price: 0,
        project_id: '',
      });
      // Component will re-fetch via realtime subscription or selectedProject change
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsData = await projectService.getAllProjects();
        const tasksData = await taskService.getTasks(selectedProject);
        
        if (projectsData) setProjects(projectsData);
        if (tasksData) {
          setTasks(tasksData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Realtime subscription
    const subscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        console.log('Change received!', payload);
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const toggleTaskStatus = async (taskId: string, currentStatus: 'pending' | 'done') => {
    const newStatus = currentStatus === 'pending' ? 'done' : 'pending';
    
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await taskService.toggleTaskStatus(taskId, currentStatus);
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert on error
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: currentStatus } : t));
    }
  };

  const filteredTasks = selectedProject === 'all' 
    ? tasks 
    : tasks.filter(t => t.project_id === selectedProject);

  const totalBudget = filteredTasks.reduce((sum, t) => sum + Number(t.total_price), 0);
  const completedBudget = filteredTasks
    .filter(t => t.status === 'done')
    .reduce((sum, t) => sum + Number(t.total_price), 0);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-zinc-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Electrical Checklist</h1>
          <p className="text-zinc-500">Manage tasks, quantities, and costs across projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-lg shadow-orange-500/20">
                <Plus className="w-4 h-4" />
                Add New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task for your construction project.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTask} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select 
                    value={newTask.project_id} 
                    onValueChange={(v) => setNewTask({...newTask, project_id: v})}
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
                  <label className="text-sm font-medium">Task Title</label>
                  <Input 
                    placeholder="e.g. Main Switchboard Installation" 
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="border-zinc-200"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <Input 
                      type="number" 
                      value={newTask.quantity}
                      onChange={(e) => setNewTask({...newTask, quantity: Number(e.target.value)})}
                      className="border-zinc-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unit Price (৳)</label>
                    <Input 
                      type="number" 
                      value={newTask.unit_price}
                      onChange={(e) => setNewTask({...newTask, unit_price: Number(e.target.value)})}
                      className="border-zinc-200"
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
                    Save Task
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Calculator className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Estimate</p>
              <p className="text-2xl font-bold text-zinc-900">৳ {totalBudget.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Completed Value</p>
              <p className="text-2xl font-bold text-zinc-900">৳ {completedBudget.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Completion Rate</p>
              <p className="text-2xl font-bold text-zinc-900">
                {totalBudget > 0 ? Math.round((completedBudget / totalBudget) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-10 border-zinc-200 focus:ring-orange-500"
          />
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[200px] border-zinc-200">
            <SelectValue placeholder="Filter by Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2 border-zinc-200">
          <Filter className="w-4 h-4" />
          More Filters
        </Button>
      </div>

      {/* Tasks Table / Mobile Cards */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow className="hover:bg-transparent border-zinc-100">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="font-semibold text-zinc-900">Task Details</TableHead>
                <TableHead className="font-semibold text-zinc-900">Quantity</TableHead>
                <TableHead className="font-semibold text-zinc-900">Unit Price</TableHead>
                <TableHead className="font-semibold text-zinc-900">Total Price</TableHead>
                <TableHead className="font-semibold text-zinc-900">Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} className="group hover:bg-zinc-50/50 border-zinc-100 transition-colors">
                  <TableCell>
                    <Checkbox 
                      checked={task.status === 'done'} 
                      onCheckedChange={() => toggleTaskStatus(task.id, task.status)}
                      className="border-zinc-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className={cn(
                        "font-medium text-zinc-900 transition-all",
                        task.status === 'done' && "line-through text-zinc-400"
                      )}>
                        {task.title}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    {task.quantity}
                  </TableCell>
                  <TableCell className="text-zinc-600">৳ {task.unit_price.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold text-zinc-900">৳ {task.total_price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-medium",
                      task.status === 'done' 
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-50" 
                        : "bg-amber-50 text-amber-600 hover:bg-amber-50"
                    )}>
                      {task.status === 'done' ? 'Completed' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-zinc-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-zinc-100">
          {filteredTasks.map((task) => (
            <div key={task.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <Checkbox 
                    checked={task.status === 'done'} 
                    onCheckedChange={() => toggleTaskStatus(task.id, task.status)}
                    className="mt-1 border-zinc-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <p className={cn(
                    "font-medium text-zinc-900 transition-all",
                    task.status === 'done' && "line-through text-zinc-400"
                  )}>
                    {task.title}
                  </p>
                </div>
                <Badge className={cn(
                  "font-medium text-[10px] uppercase tracking-wider",
                  task.status === 'done' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                  {task.status === 'done' ? 'Done' : 'Pending'}
                </Badge>
              </div>
              <div className="flex justify-between text-sm pl-8">
                <span className="text-zinc-500">{task.quantity} units @ ৳{task.unit_price.toLocaleString()}</span>
                <span className="font-bold text-zinc-900">৳ {task.total_price.toLocaleString()}</span>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="p-8 text-center text-zinc-500">No tasks found.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Checklist;
