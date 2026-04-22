import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Loader2, 
  ArrowUpRight,
  Wallet,
  CreditCard,
  Smartphone,
  Banknote
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase, Payment, Project, Contractor } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'motion/react';

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBKashOpen, setIsBKashOpen] = useState(false);
  const [bKashStep, setBKashStep] = useState(1); // 1: Amount, 2: PIN, 3: Success

  const [newPayment, setNewPayment] = useState({
    project_id: '',
    contractor_id: '',
    amount: 0,
    payment_method: 'bKash',
    reference: ''
  });

  const fetchData = async () => {
    try {
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*, projects(name), contractors(name)')
        .order('created_at', { ascending: false });
      
      const { data: projectsData } = await supabase.from('projects').select('*');
      const { data: contractorsData } = await supabase.from('contractors').select('*');

      if (paymentsData) setPayments(paymentsData as any);
      if (projectsData) setProjects(projectsData);
      if (contractorsData) setContractors(contractorsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPayment.project_id || newPayment.amount <= 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('payments')
        .insert([{
          project_id: newPayment.project_id,
          contractor_id: newPayment.contractor_id === 'none' ? null : newPayment.contractor_id,
          amount: newPayment.amount,
          payment_method: newPayment.payment_method,
          reference: newPayment.reference || `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          status: 'completed'
        }]);

      if (error) throw error;

      setIsDialogOpen(false);
      setIsBKashOpen(false);
      setNewPayment({
        project_id: '',
        contractor_id: '',
        amount: 0,
        payment_method: 'bKash',
        reference: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error adding payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bKash':
      case 'Nagad':
      case 'Rocket':
        return <Smartphone className="w-4 h-4 text-pink-600" />;
      case 'Bank':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      default:
        return <Banknote className="w-4 h-4 text-emerald-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Payment Ledger</h1>
          <p className="text-zinc-500">Track all site expenses and contractor payments.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Dialog open={isBKashOpen} onOpenChange={setIsBKashOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#D12053] hover:bg-[#B01B46] text-white gap-2 shadow-lg shadow-[#D12053]/20">
                <Smartphone className="w-4 h-4" />
                Pay via bKash
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-[#D12053] border-none">
              <div className="p-8 space-y-6 text-white">
                <div className="flex justify-between items-center">
                  <img src="https://www.logo.wine/a/logo/BKash/BKash-bKash-Logo.wine.svg" alt="bKash" className="h-12 invert brightness-0" />
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Merchant</p>
                    <p className="font-bold">Const OS Ltd.</p>
                  </div>
                </div>

                {bKashStep === 1 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase opacity-70">Select Project</label>
                        <Select onValueChange={(v) => setNewPayment({...newPayment, project_id: v})}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase opacity-70">Amount (৳)</label>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 text-2xl font-bold"
                          onChange={(e) => setNewPayment({...newPayment, amount: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={() => setBKashStep(2)}
                      className="w-full h-14 bg-white text-[#D12053] hover:bg-zinc-100 font-bold text-lg"
                    >
                      Next
                    </Button>
                  </motion.div>
                )}

                {bKashStep === 2 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
                    <p className="text-sm opacity-80">Enter your bKash PIN to confirm payment of</p>
                    <p className="text-4xl font-black">৳ {newPayment.amount.toLocaleString()}</p>
                    <div className="flex justify-center gap-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-12 h-14 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-2xl font-bold">
                          •
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={handleAddPayment}
                      disabled={isSubmitting}
                      className="w-full h-14 bg-white text-[#D12053] hover:bg-zinc-100 font-bold text-lg"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Payment'}
                    </Button>
                    <button onClick={() => setBKashStep(1)} className="text-xs opacity-60 hover:opacity-100 underline">Go Back</button>
                  </motion.div>
                )}
              </div>
              <div className="bg-zinc-900 p-4 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Secure Payment by bKash</p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-lg shadow-orange-500/20">
                <Plus className="w-4 h-4" />
                Record Payment
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>Enter payment details for contractors or site expenses.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPayment} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select 
                  value={newPayment.project_id} 
                  onValueChange={(v) => setNewPayment({...newPayment, project_id: v})}
                >
                  <SelectTrigger className="border-zinc-200">
                    <SelectValue placeholder="Select project" />
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
                  value={newPayment.contractor_id} 
                  onValueChange={(v) => setNewPayment({...newPayment, contractor_id: v})}
                >
                  <SelectTrigger className="border-zinc-200">
                    <SelectValue placeholder="Select contractor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General Expense</SelectItem>
                    {contractors.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (৳)</label>
                  <Input 
                    type="number" 
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: Number(e.target.value)})}
                    className="border-zinc-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Method</label>
                  <Select 
                    value={newPayment.payment_method} 
                    onValueChange={(v) => setNewPayment({...newPayment, payment_method: v})}
                  >
                    <SelectTrigger className="border-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bKash">bKash</SelectItem>
                      <SelectItem value="Nagad">Nagad</SelectItem>
                      <SelectItem value="Rocket">Rocket</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reference / TxID</label>
                <Input 
                  placeholder="e.g. TxID: 9K2L8M..." 
                  value={newPayment.reference}
                  onChange={(e) => setNewPayment({...newPayment, reference: e.target.value})}
                  className="border-zinc-200"
                />
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save Payment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    {/* Summary Card */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="p-8 flex-1 border-b md:border-b-0 md:border-r border-zinc-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-zinc-900">Total Disbursed</h3>
              </div>
              <p className="text-4xl font-black text-zinc-900">৳ {totalPaid.toLocaleString()}</p>
              <p className="text-sm text-zinc-500 mt-2 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                Across {projects.length} active projects
              </p>
            </div>
            <div className="p-8 flex-1 bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                {['bKash', 'Nagad', 'Cash'].map(method => {
                  const methodTotal = payments
                    .filter(p => p.payment_method === method)
                    .reduce((sum, p) => sum + Number(p.amount), 0);
                  const percentage = totalPaid > 0 ? (methodTotal / totalPaid) * 100 : 0;
                  
                  return (
                    <div key={method} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-600">{method}</span>
                        <span className="text-zinc-900">৳ {methodTotal.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-zinc-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Transaction History</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input placeholder="Search transactions..." className="pl-10 border-zinc-200" />
            </div>
          </div>
        </CardHeader>
        
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow className="hover:bg-transparent border-zinc-100">
                <TableHead className="font-semibold text-zinc-900">Date</TableHead>
                <TableHead className="font-semibold text-zinc-900">Project</TableHead>
                <TableHead className="font-semibold text-zinc-900">Recipient</TableHead>
                <TableHead className="font-semibold text-zinc-900">Method</TableHead>
                <TableHead className="font-semibold text-zinc-900">Amount</TableHead>
                <TableHead className="font-semibold text-zinc-900">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-zinc-50/50 border-zinc-100 transition-colors">
                  <TableCell className="text-zinc-500 text-sm">
                    {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-900">
                    {(payment as any).projects?.name}
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    {(payment as any).contractors?.name || 'General Expense'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-zinc-600">
                      {getMethodIcon(payment.payment_method)}
                      <span className="text-sm">{payment.payment_method}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-zinc-900">
                    ৳ {Number(payment.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 font-medium">
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-zinc-100">
          {payments.map((payment) => (
            <div key={payment.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-zinc-400">{format(new Date(payment.created_at), 'MMM dd, yyyy')}</p>
                  <h3 className="font-bold text-zinc-900">{(payment as any).projects?.name}</h3>
                </div>
                <p className="text-lg font-black text-zinc-900">৳ {Number(payment.amount).toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getMethodIcon(payment.payment_method)}
                  <span className="text-xs text-zinc-500">{(payment as any).contractors?.name || 'General Expense'}</span>
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 text-[10px] uppercase font-bold">
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
          {payments.length === 0 && (
            <div className="p-8 text-center text-zinc-500">No transactions found.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Payments;
