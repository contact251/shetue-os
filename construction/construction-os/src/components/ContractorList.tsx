import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Phone, 
  Mail, 
  Search,
  MoreVertical,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Contractor, supabase } from '@/lib/supabase';

const ContractorList: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  const mockContractors: Contractor[] = [
    {
      id: 'c1',
      name: 'Rahman Electricals',
      specialty: 'Electrical Systems',
      phone: '01711223344',
      email: 'contact@rahmanelec.com',
      created_at: new Date().toISOString()
    },
    {
      id: 'c2',
      name: 'Dhaka Plumbing Solutions',
      specialty: 'Plumbing & Sanitary',
      phone: '01811223344',
      email: 'info@dhakaplumbing.com',
      created_at: new Date().toISOString()
    },
    {
      id: 'c3',
      name: 'Modern Civil Works',
      specialty: 'Civil & Structural',
      phone: '01911223344',
      email: 'projects@moderncivil.com',
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const { data } = await supabase.from('contractors').select('*');
        if (data && data.length > 0) {
          setContractors(data);
        } else {
          setContractors(mockContractors);
        }
      } catch (error) {
        console.error('Error fetching contractors:', error);
        setContractors(mockContractors);
      } finally {
        setLoading(false);
      }
    };

    fetchContractors();
  }, []);

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Contractors</h1>
          <p className="text-zinc-500">Manage your network of specialized contractors and vendors.</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-lg shadow-orange-500/20">
          <UserPlus className="w-4 h-4" />
          Add Contractor
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search contractors by name or specialty..." 
            className="pl-10 border-zinc-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contractors.map((contractor) => (
          <Card key={contractor.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <Avatar className="w-12 h-12 border-2 border-zinc-100">
                  <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                    {contractor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" className="text-zinc-400">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="mt-4">
                <h3 className="font-bold text-lg text-zinc-900 group-hover:text-orange-600 transition-colors">
                  {contractor.name}
                </h3>
                <p className="text-sm text-orange-600 font-medium">{contractor.specialty}</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <Phone className="w-4 h-4 text-zinc-400" />
                  {contractor.phone}
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  {contractor.email}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-50 flex gap-2">
                <Button variant="outline" className="flex-1 text-xs h-8 border-zinc-200">View History</Button>
                <Button variant="outline" className="flex-1 text-xs h-8 border-zinc-200">Assign Project</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContractorList;
