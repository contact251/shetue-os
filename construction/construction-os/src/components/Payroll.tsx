import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  CheckCircle2, 
  FileText, 
  Loader2, 
  Search,
  Calendar,
  ArrowRight,
  Smartphone,
  Download,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase, Project, LaborAttendance } from '@/lib/supabase';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface WorkerPayroll {
  worker_name: string;
  role: string;
  total_wage: number;
  days_worked: number;
  records: LaborAttendance[];
}

const Payroll: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [unpaidAttendance, setUnpaidAttendance] = useState<LaborAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchUnpaidAttendance();
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*');
    if (data) {
      setProjects(data);
      if (data.length > 0) setSelectedProjectId(data[0].id);
    }
  };

  const fetchUnpaidAttendance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('labor_attendance')
      .select('*')
      .eq('project_id', selectedProjectId)
      .is('payment_id', null)
      .eq('status', 'present');

    if (error) console.error('Error fetching attendance:', error);
    else setUnpaidAttendance(data || []);
    setLoading(false);
  };

  const workerGroups = unpaidAttendance.reduce<Record<string, WorkerPayroll>>((acc, curr) => {
    if (!acc[curr.worker_name]) {
      acc[curr.worker_name] = {
        worker_name: curr.worker_name,
        role: curr.role,
        total_wage: 0,
        days_worked: 0,
        records: []
      };
    }
    acc[curr.worker_name].total_wage += Number(curr.wage);
    acc[curr.worker_name].days_worked += 1;
    acc[curr.worker_name].records.push(curr);
    return acc;
  }, {});

  const filteredWorkers = (Object.values(workerGroups) as WorkerPayroll[]).filter(w => 
    w.worker_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleWorkerSelection = (workerName: string) => {
    setSelectedWorkers(prev => 
      prev.includes(workerName) 
        ? prev.filter(name => name !== workerName)
        : [...prev, workerName]
    );
  };

  const handleProcessPayroll = async (method: string) => {
    if (selectedWorkers.length === 0) return;
    setProcessing(true);

    try {
      for (const workerName of selectedWorkers) {
        const workerData = workerGroups[workerName];
        
        // 1. Create Payment Record
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert([{
            project_id: selectedProjectId,
            amount: workerData.total_wage,
            payment_method: method,
            reference: `Payroll: ${workerName} (${workerData.days_worked} days)`,
            status: 'completed'
          }])
          .select()
          .single();

        if (paymentError) throw paymentError;

        // 2. Update Attendance Records
        const recordIds = workerData.records.map(r => r.id);
        const { error: updateError } = await supabase
          .from('labor_attendance')
          .update({ payment_id: payment.id })
          .in('id', recordIds);

        if (updateError) throw updateError;
      }

      setSelectedWorkers([]);
      fetchUnpaidAttendance();
    } catch (error) {
      console.error('Error processing payroll:', error);
    } finally {
      setProcessing(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const project = projects.find(p => p.id === selectedProjectId);

    doc.setFontSize(20);
    doc.text('Payroll Summary Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Project: ${project?.name || 'All Projects'}`, 14, 30);
    doc.text(`Date: ${format(new Date(), 'PPP')}`, 14, 35);

    const tableData = filteredWorkers.map(w => [
      w.worker_name,
      w.role,
      w.days_worked,
      `৳ ${w.total_wage.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Worker Name', 'Role', 'Days Worked', 'Total Wage']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] } // Orange-500
    });

    doc.save(`payroll-${project?.name || 'report'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const totalSelectedWage = selectedWorkers.reduce((sum, name) => sum + (workerGroups[name]?.total_wage || 0), 0);

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Payroll Management</h1>
          <p className="text-zinc-500">Process wages for site workers based on attendance.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full md:w-64 bg-white border-zinc-200">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={generatePDF}
            className="border-zinc-200 gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="premium-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-2xl">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Unpaid Workers</p>
              <p className="text-2xl font-black text-zinc-900">{filteredWorkers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="premium-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-2xl">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Pending Wages</p>
              <p className="text-2xl font-black text-zinc-900">৳ {(Object.values(workerGroups) as WorkerPayroll[]).reduce((s, w) => s + w.total_wage, 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="premium-card bg-zinc-900 text-white border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase font-bold tracking-wider">Selected to Pay</p>
              <p className="text-2xl font-black">৳ {totalSelectedWage.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="premium-card">
        <CardHeader className="border-b border-zinc-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg">Pending Payroll</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                placeholder="Search workers..." 
                className="pl-10 border-zinc-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="hover:bg-transparent border-zinc-100">
              <TableHead className="w-12"></TableHead>
              <TableHead className="font-semibold text-zinc-900">Worker Name</TableHead>
              <TableHead className="font-semibold text-zinc-900">Role</TableHead>
              <TableHead className="font-semibold text-zinc-900">Days Worked</TableHead>
              <TableHead className="font-semibold text-zinc-900">Total Wage</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                    <p className="text-zinc-500 mt-2">Loading payroll data...</p>
                  </TableCell>
                </TableRow>
              ) : filteredWorkers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-zinc-500">
                    No pending payroll for this project.
                  </TableCell>
                </TableRow>
              ) : filteredWorkers.map((worker) => (
                <motion.tr 
                  key={worker.worker_name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "hover:bg-zinc-50/50 border-zinc-100 transition-colors",
                    selectedWorkers.includes(worker.worker_name) && "bg-orange-50/30"
                  )}
                >
                  <TableCell>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                      checked={selectedWorkers.includes(worker.worker_name)}
                      onChange={() => toggleWorkerSelection(worker.worker_name)}
                    />
                  </TableCell>
                  <TableCell className="font-bold text-zinc-900">{worker.worker_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-zinc-100 text-zinc-600 border-none font-medium">
                      {worker.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-600 font-medium">
                    {worker.days_worked} Days
                  </TableCell>
                  <TableCell className="font-black text-zinc-900">
                    ৳ {worker.total_wage.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                          Pay Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[400px] bg-white">
                        <DialogHeader>
                          <DialogTitle>Process Payment</DialogTitle>
                          <DialogDescription>
                            Confirm wage payment for {worker.worker_name}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-zinc-500 uppercase font-bold">Total Amount</span>
                              <span className="text-xl font-black text-zinc-900">৳ {worker.total_wage.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-zinc-400">For {worker.days_worked} days of site work</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Payment Method</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['bKash', 'Nagad', 'Cash', 'Bank'].map(m => (
                                <Button 
                                  key={m}
                                  variant="outline"
                                  className="justify-start gap-2 border-zinc-200"
                                  onClick={() => {
                                    setSelectedWorkers([worker.worker_name]);
                                    handleProcessPayroll(m);
                                  }}
                                >
                                  {m === 'bKash' && <Smartphone className="w-4 h-4 text-[#D12053]" />}
                                  {m}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </Card>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedWorkers.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6"
          >
            <div className="bg-zinc-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-6 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-bold">
                  {selectedWorkers.length}
                </div>
                <div>
                  <p className="text-sm font-bold">Workers Selected</p>
                  <p className="text-xs text-white/50">Total: ৳ {totalSelectedWage.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedWorkers([])}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 font-bold">
                      Process Bulk Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Bulk Payroll Processing</DialogTitle>
                      <DialogDescription>
                        Confirm payment for {selectedWorkers.length} workers.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                      <div className="p-4 bg-zinc-900 text-white rounded-xl">
                        <p className="text-xs text-white/50 uppercase font-bold">Total Disbursement</p>
                        <p className="text-3xl font-black">৳ {totalSelectedWage.toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {['bKash', 'Nagad', 'Cash', 'Bank'].map(m => (
                          <Button 
                            key={m}
                            className="h-12 justify-between border-zinc-200"
                            variant="outline"
                            onClick={() => handleProcessPayroll(m)}
                          >
                            <span className="flex items-center gap-2">
                              {m === 'bKash' && <Smartphone className="w-4 h-4 text-[#D12053]" />}
                              Pay via {m}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default Payroll;
