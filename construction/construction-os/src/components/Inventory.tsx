import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Minus, 
  History, 
  AlertTriangle, 
  ArrowDown, 
  ArrowUp,
  Search,
  Loader2,
  Calendar as CalendarIcon,
  FileText
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
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase, InventoryItem, InventoryLog, Project } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getSupplierSuggestions, SuggestedSupplier } from '@/services/geminiService';
import { Sparkles, Store, Phone, Mail, CheckCircle } from 'lucide-react';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [dialogType, setDialogType] = useState<'in' | 'out' | 'history' | 'new' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // AI Suggestions states
  const [suggestions, setSuggestions] = useState<SuggestedSupplier[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestingItem, setSuggestingItem] = useState<InventoryItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    quantity: 0,
    note: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const [newItemData, setNewItemData] = useState({
    material_name: '',
    unit: 'bags',
    min_stock: 10,
    unit_price: 0,
    project_id: '',
    initial_stock: 0
  });

  const fetchInventory = async () => {
    try {
      const { data: inventoryData } = await supabase.from('inventory').select('*').order('material_name');
      const { data: projectsData } = await supabase.from('projects').select('*');
      
      if (inventoryData) setItems(inventoryData);
      if (projectsData) setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    // Real-time subscription
    const channel = supabase
      .channel('inventory_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
        fetchInventory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async (itemId: string) => {
    setLoadingLogs(true);
    try {
      const { data } = await supabase
        .from('inventory_logs')
        .select('*')
        .eq('inventory_id', itemId)
        .order('created_at', { ascending: false });
      if (data) setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !dialogType || (dialogType !== 'in' && dialogType !== 'out')) return;

    if (dialogType === 'out' && formData.quantity > selectedItem.current_stock) {
      alert('Cannot stock out more than available quantity!');
      return;
    }

    setIsSubmitting(true);
    try {
      const newStock = dialogType === 'in' 
        ? Number(selectedItem.current_stock) + Number(formData.quantity)
        : Number(selectedItem.current_stock) - Number(formData.quantity);

      // 1. Update inventory
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ current_stock: newStock })
        .eq('id', selectedItem.id);

      if (updateError) throw updateError;

      // 2. Insert log
      const { error: logError } = await supabase
        .from('inventory_logs')
        .insert([{
          inventory_id: selectedItem.id,
          type: dialogType,
          quantity: formData.quantity,
          note: formData.note,
          created_at: new Date(formData.date).toISOString()
        }]);

      if (logError) throw logError;

      setDialogType(null);
      setFormData({ quantity: 0, note: '', date: format(new Date(), 'yyyy-MM-dd') });
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemData.project_id || !newItemData.material_name) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert([{
          material_name: newItemData.material_name,
          unit: newItemData.unit,
          min_stock: newItemData.min_stock,
          unit_price: newItemData.unit_price,
          project_id: newItemData.project_id,
          current_stock: newItemData.initial_stock
        }])
        .select();

      if (error) throw error;

      if (newItemData.initial_stock > 0 && data?.[0]) {
        await supabase.from('inventory_logs').insert([{
          inventory_id: data[0].id,
          type: 'in',
          quantity: newItemData.initial_stock,
          note: 'Initial stock'
        }]);
      }

      setDialogType(null);
      setNewItemData({
        material_name: '',
        unit: 'bags',
        min_stock: 10,
        unit_price: 0,
        project_id: '',
        initial_stock: 0
      });
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetSuggestions = async (item: InventoryItem) => {
    setSuggestingItem(item);
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    
    const project = projects.find(p => p.id === item.project_id);
    const location = project?.location || 'Bangladesh';
    
    const results = await getSupplierSuggestions(item.material_name, location);
    setSuggestions(results);
    setLoadingSuggestions(false);
  };

  const handleAddSupplier = async (supplier: SuggestedSupplier) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('contractors')
        .insert([{
          name: supplier.name,
          specialty: supplier.specialty,
          phone: supplier.phone,
          email: supplier.email,
          owner_id: user.id
        }]);

      if (error) throw error;
      alert(`${supplier.name} added to your contractors!`);
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('Failed to add supplier.');
    }
  };

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
          <h1 className="text-3xl font-bold text-zinc-900">Material Inventory</h1>
          <p className="text-zinc-500">Track stock levels and material usage across all sites.</p>
        </div>
        <Button 
          onClick={() => setDialogType('new')}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          Add New Material
        </Button>
      </div>

      {/* Low Stock Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.filter(item => Number(item.current_stock) <= Number(item.min_stock)).map(item => (
          <Card key={item.id} className="border-none shadow-sm bg-rose-50 border-l-4 border-l-rose-500">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-rose-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Critical Stock</p>
                <p className="text-sm font-medium text-zinc-900">{item.material_name} is low!</p>
                <p className="text-xs text-zinc-500">Only {item.current_stock} {item.unit} left</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-rose-600 font-bold mt-1 gap-1"
                  onClick={() => handleGetSuggestions(item)}
                >
                  <Sparkles className="w-3 h-3" />
                  Find Suppliers
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inventory Table / Mobile Cards */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-zinc-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg">Stock Registry</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input placeholder="Search materials..." className="pl-10 border-zinc-200" />
            </div>
          </div>
        </CardHeader>
        
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow className="hover:bg-transparent border-zinc-100">
                <TableHead className="font-semibold text-zinc-900">Material Name</TableHead>
                <TableHead className="font-semibold text-zinc-900 text-center">Current Stock</TableHead>
                <TableHead className="font-semibold text-zinc-900">Unit</TableHead>
                <TableHead className="font-semibold text-zinc-900">Unit Price</TableHead>
                <TableHead className="font-semibold text-zinc-900">Total Value</TableHead>
                <TableHead className="font-semibold text-zinc-900">Status</TableHead>
                <TableHead className="font-semibold text-zinc-900 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="hover:bg-zinc-50/50 border-zinc-100 transition-colors">
                  <TableCell className="font-medium text-zinc-900">
                    <button 
                      onClick={() => {
                        setSelectedItem(item);
                        setDialogType('history');
                        fetchLogs(item.id);
                      }}
                      className="hover:text-orange-600 transition-colors text-left"
                    >
                      {item.material_name}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-lg font-bold",
                      Number(item.current_stock) <= Number(item.min_stock) ? "text-rose-600" : "text-zinc-900"
                    )}>
                      {item.current_stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-500 uppercase text-xs font-bold">{item.unit}</TableCell>
                  <TableCell className="text-zinc-600">৳ {item.unit_price.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold text-zinc-900">৳ {(item.current_stock * item.unit_price).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-medium",
                      Number(item.current_stock) <= Number(item.min_stock) 
                        ? "bg-rose-50 text-rose-600 hover:bg-rose-50" 
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-50"
                    )}>
                      {Number(item.current_stock) <= Number(item.min_stock) ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedItem(item);
                          setDialogType('in');
                        }}
                        className="h-8 border-zinc-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                      >
                        <ArrowUp className="w-3 h-3 mr-1" /> Stock In
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedItem(item);
                          setDialogType('out');
                        }}
                        className="h-8 border-zinc-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                      >
                        <ArrowDown className="w-3 h-3 mr-1" /> Stock Out
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-zinc-100">
          {items.map((item) => (
            <div key={item.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-zinc-900">{item.material_name}</h3>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{item.unit}</p>
                </div>
                <Badge className={cn(
                  "font-medium",
                  Number(item.current_stock) <= Number(item.min_stock) 
                    ? "bg-rose-50 text-rose-600" 
                    : "bg-emerald-50 text-emerald-600"
                )}>
                  {Number(item.current_stock) <= Number(item.min_stock) ? 'Low' : 'OK'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Current</p>
                  <p className={cn(
                    "text-xl font-black",
                    Number(item.current_stock) <= Number(item.min_stock) ? "text-rose-600" : "text-zinc-900"
                  )}>
                    {item.current_stock}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Total Value</p>
                  <p className="text-lg font-bold text-zinc-900">
                    ৳ {(item.current_stock * item.unit_price).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    ৳ {item.unit_price.toLocaleString()} / {item.unit}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedItem(item);
                      setDialogType('in');
                    }}
                    className="h-10 border-zinc-200 text-emerald-600"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedItem(item);
                      setDialogType('out');
                    }}
                    className="h-10 border-zinc-200 text-rose-600"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedItem(item);
                      setDialogType('history');
                      fetchLogs(item.id);
                    }}
                    className="h-10 border-zinc-200 text-zinc-500"
                  >
                    <History className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

      {/* Stock In/Out Dialog */}
      <Dialog open={dialogType === 'in' || dialogType === 'out'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogType === 'in' ? (
                <><ArrowUp className="w-5 h-5 text-emerald-600" /> Stock In</>
              ) : (
                <><ArrowDown className="w-5 h-5 text-rose-600" /> Stock Out</>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.material_name} ({selectedItem?.current_stock} {selectedItem?.unit} available)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockUpdate} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity ({selectedItem?.unit})</label>
              <Input 
                type="number" 
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                className="border-zinc-200"
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="border-zinc-200"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input 
                placeholder="e.g. Received from vendor X" 
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                className="border-zinc-200"
              />
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className={cn(
                  "w-full text-white",
                  dialogType === 'in' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                )}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Confirm {dialogType === 'in' ? 'Stock In' : 'Stock Out'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Material Dialog */}
      <Dialog open={dialogType === 'new'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
            <DialogDescription>Register a new material to track in your inventory.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateItem} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select 
                value={newItemData.project_id} 
                onValueChange={(v) => setNewItemData({...newItemData, project_id: v})}
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
              <label className="text-sm font-medium">Material Name</label>
              <Input 
                placeholder="e.g. Cement (Seven Rings)" 
                value={newItemData.material_name}
                onChange={(e) => setNewItemData({...newItemData, material_name: e.target.value})}
                className="border-zinc-200"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <Input 
                  placeholder="bags, tons, pcs" 
                  value={newItemData.unit}
                  onChange={(e) => setNewItemData({...newItemData, unit: e.target.value})}
                  className="border-zinc-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Level</label>
                <Input 
                  type="number" 
                  value={newItemData.min_stock}
                  onChange={(e) => setNewItemData({...newItemData, min_stock: Number(e.target.value)})}
                  className="border-zinc-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit Price (৳)</label>
                <Input 
                  type="number" 
                  value={newItemData.unit_price}
                  onChange={(e) => setNewItemData({...newItemData, unit_price: Number(e.target.value)})}
                  className="border-zinc-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Stock</label>
                <Input 
                  type="number" 
                  value={newItemData.initial_stock}
                  onChange={(e) => setNewItemData({...newItemData, initial_stock: Number(e.target.value)})}
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
                Create Material
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={dialogType === 'history'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-orange-500" />
              Stock History
            </DialogTitle>
            <DialogDescription>
              Recent transactions for {selectedItem?.material_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden mt-4">
            {loadingLogs ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {logs.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8">No transaction history found.</p>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="relative pl-6 pb-4 border-l border-zinc-100 last:pb-0">
                        <div className={cn(
                          "absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full",
                          log.type === 'in' ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-zinc-900">
                              {log.type === 'in' ? 'Stock In' : 'Stock Out'} - {log.quantity} {selectedItem?.unit}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {format(new Date(log.created_at), 'MMM dd, yyyy')}
                            </p>
                            {log.note && (
                              <p className="text-xs text-zinc-400 mt-2 bg-zinc-50 p-2 rounded flex items-start gap-2">
                                <FileText className="w-3 h-3 mt-0.5 shrink-0" />
                                {log.note}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-[10px] uppercase tracking-wider",
                            log.type === 'in' ? "text-emerald-600 border-emerald-100 bg-emerald-50" : "text-rose-600 border-rose-100 bg-rose-50"
                          )}>
                            {log.type}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
          <Separator className="my-4" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)} className="w-full">
              Close History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Supplier Suggestions Dialog */}
      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              AI Supplier Suggestions
            </DialogTitle>
            <DialogDescription>
              Recommended suppliers for {suggestingItem?.material_name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {loadingSuggestions ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <p className="text-sm text-zinc-500 animate-pulse">Gemini is analyzing local markets...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((supplier, idx) => (
                  <Card key={idx} className="border border-zinc-100 shadow-none hover:border-orange-200 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-orange-50 rounded-lg">
                            <Store className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900">{supplier.name}</h4>
                            <p className="text-xs text-zinc-500">{supplier.specialty}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-orange-600 hover:bg-orange-50"
                          onClick={() => handleAddSupplier(supplier)}
                        >
                          Add to List
                        </Button>
                      </div>
                      
                      <p className="text-xs text-zinc-600 bg-zinc-50 p-2 rounded italic">
                        "{supplier.reason}"
                      </p>

                      <div className="flex gap-4 pt-1">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                          <Phone className="w-3 h-3" />
                          {supplier.phone}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                          <Mail className="w-3 h-3" />
                          {supplier.email}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuggestions(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
