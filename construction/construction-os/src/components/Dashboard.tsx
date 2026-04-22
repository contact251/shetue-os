import React from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';

const data = [
  { name: 'Jan', progress: 40, budget: 2400 },
  { name: 'Feb', progress: 55, budget: 1398 },
  { name: 'Mar', progress: 48, budget: 9800 },
  { name: 'Apr', progress: 70, budget: 3908 },
  { name: 'May', progress: 85, budget: 4800 },
  { name: 'Jun', progress: 92, budget: 3800 },
];

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f43f5e'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState({
    activeProjects: 0,
    completedTasks: 0,
    pendingApprovals: 0,
    totalExpenses: 0,
    totalPaid: 0,
    totalTaskValue: 0,
    totalLaborCost: 0,
    paidLaborCost: 0
  });
  const [projectCosts, setProjectCosts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await projectService.getProjectStats();
        const costsData = await projectService.getProjectCosts();
        
        const { count: taskCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'done');

        setStats({
          activeProjects: statsData.activeProjects,
          completedTasks: taskCount || 0,
          pendingApprovals: 24,
          totalExpenses: statsData.totalLiability,
          totalPaid: statsData.totalPaid,
          totalTaskValue: costsData?.reduce((sum, p) => sum + Number(p.task_cost), 0) || 0,
          totalLaborCost: costsData?.reduce((sum, p) => sum + Number(p.labor_cost), 0) || 0,
          paidLaborCost: costsData?.reduce((sum, p) => sum + Number(p.paid_labor_cost), 0) || 0
        });

        if (costsData) setProjectCosts(costsData);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Project Overview</h1>
          <p className="text-zinc-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="text-left md:text-right bg-white p-4 rounded-xl shadow-sm border border-zinc-100 flex-1 md:flex-none">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Liability</p>
            <p className="text-xl md:text-2xl font-bold text-zinc-900">৳ {stats.totalExpenses.toLocaleString()}</p>
          </div>
          <div className="text-left md:text-right bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-100 flex-1 md:flex-none">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Total Paid</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-700">৳ {stats.totalPaid.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                12%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">Active Projects</p>
              <h3 className="text-2xl font-bold text-zinc-900">{stats.activeProjects}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                8%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">Completed Tasks</p>
              <h3 className="text-2xl font-bold text-zinc-900">{stats.completedTasks}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <Badge className="bg-orange-50 text-orange-600 hover:bg-orange-50 border-none">
                Payroll
              </Badge>
            </div>
            <p className="text-sm font-medium text-zinc-500">Paid Labor</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-zinc-900">৳ {stats.paidLaborCost.toLocaleString()}</h3>
              <span className="text-xs text-zinc-400">/ ৳ {stats.totalLaborCost.toLocaleString()}</span>
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <span>Payment Progress</span>
                <span>{Math.round((stats.paidLaborCost / (stats.totalLaborCost || 1)) * 100)}%</span>
              </div>
              <Progress value={(stats.paidLaborCost / (stats.totalLaborCost || 1)) * 100} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                18%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">Total Liability</p>
              <h3 className="text-2xl font-bold text-zinc-900">৳ {(stats.totalExpenses / 1000000).toFixed(1)}M</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Project Cost Breakdown</CardTitle>
              <CardDescription>Material, Labor, and Task costs per project</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectCosts} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 11, fontWeight: 500}}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="material_cost" name="Materials" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="labor_cost" name="Labor" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="task_cost" name="Tasks" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Task Value Distribution</CardTitle>
            <CardDescription>Task costs across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectCosts.map(p => ({ name: p.name, value: Number(p.task_cost) }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectCosts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `৳ ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 max-h-[100px] overflow-y-auto pr-2">
              {projectCosts.map((p, index) => (
                <div key={p.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-zinc-600 truncate max-w-[120px]">{p.name}</span>
                  </div>
                  <span className="font-bold">৳ {Number(p.task_cost).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Active Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { name: 'Gulshan Residential', progress: 75, status: 'On Track' },
              { name: 'Banani Commercial', progress: 45, status: 'Delayed' },
              { name: 'Uttara Apartment', progress: 90, status: 'Near Completion' },
            ].map((project, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-zinc-900">{project.name}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    project.status === 'Delayed' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {project.status}
                  </span>
                </div>
                <Progress value={project.progress} className="h-2 bg-zinc-100" />
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'warning', msg: 'Material shortage at Gulshan site', time: '2h ago' },
                { type: 'info', msg: 'New contractor assigned to Banani', time: '4h ago' },
                { type: 'error', msg: 'Budget overrun detected in Phase 2', time: '1d ago' },
              ].map((alert, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-zinc-50 transition-colors">
                  <div className={cn(
                    "p-2 rounded-full h-fit",
                    alert.type === 'warning' ? "bg-amber-100 text-amber-600" :
                    alert.type === 'error' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                  )}>
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900">{alert.msg}</p>
                    <p className="text-xs text-zinc-400">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
