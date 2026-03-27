import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNgos, useApplyNgo } from '@/hooks/use-ngos';
import { useCampaigns, useCreateCampaign, useCloseCampaign } from '@/hooks/use-campaigns';
import { Card, Button, Input, Textarea, Badge, Dialog } from '@/components/ui';
import { Redirect } from 'wouter';
import { formatCurrency } from '@/lib/utils';
import { PlusCircle, Building2, Ban, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function NgoDashboard() {
  const { user } = useAuth();
  
  // Find current NGO associated with user
  const { data: ngos, isLoading: ngosLoading } = useNgos();
  const myNgo = ngos?.find(n => typeof n.user === 'object' ? (n.user as any)._id === user?.id : n.user === user?.id);
  
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
  const myCampaigns = campaigns?.filter(c => typeof c.ngo === 'object' ? c.ngo._id === myNgo?._id : c.ngo === myNgo?._id) || [];

  const [applyOpen, setApplyOpen] = useState(false);
  const applyMutation = useApplyNgo();
  const [applyForm, setApplyForm] = useState({ name: '', description: '', registrationNumber: '', website: '', contactEmail: '', country: '', address: '' });

  const [campaignOpen, setCampaignOpen] = useState(false);
  const createCampaign = useCreateCampaign();
  const closeCampaign = useCloseCampaign();
  const [campaignForm, setCampaignForm] = useState({ title: '', description: '', goalAmount: '', category: 'education', startDate: '', endDate: '', beneficiaries: '' });

  if (!user) return <Redirect to="/login" />;
  if (user.role !== 'NGO') return <div className="p-20 text-center font-bold">Access Denied. Only NGOs.</div>;

  if (ngosLoading) return <div className="p-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await applyMutation.mutateAsync({ ...applyForm, categories: ['general'] });
      toast.success("Application submitted! Please wait for Admin verification.");
      setApplyOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to apply");
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCampaign.mutateAsync({
        ...campaignForm,
        goalAmount: parseFloat(campaignForm.goalAmount)
      });
      toast.success("Campaign created successfully!");
      setCampaignOpen(false);
      setCampaignForm({ title: '', description: '', goalAmount: '', category: 'education', startDate: '', endDate: '', beneficiaries: '' });
    } catch (err: any) {
      toast.error(err.message || "Failed to create campaign");
    }
  };

  if (!myNgo) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Building2 className="w-20 h-20 mx-auto text-muted-foreground/30 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Complete your NGO Profile</h1>
        <p className="text-xl text-muted-foreground mb-8">Before creating campaigns, you must apply for verification.</p>
        <Button size="lg" onClick={() => setApplyOpen(true)}>Apply for Verification</Button>

        <Dialog isOpen={applyOpen} onClose={() => setApplyOpen(false)} title="NGO Application Form">
          <form onSubmit={handleApply} className="space-y-4 text-left">
            <Input placeholder="Organization Name" value={applyForm.name} onChange={e => setApplyForm({...applyForm, name: e.target.value})} required />
            <Input placeholder="Registration Number" value={applyForm.registrationNumber} onChange={e => setApplyForm({...applyForm, registrationNumber: e.target.value})} required />
            <Textarea placeholder="Organization Description" value={applyForm.description} onChange={e => setApplyForm({...applyForm, description: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
              <Input type="email" placeholder="Contact Email" value={applyForm.contactEmail} onChange={e => setApplyForm({...applyForm, contactEmail: e.target.value})} required />
              <Input placeholder="Website URL" value={applyForm.website} onChange={e => setApplyForm({...applyForm, website: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Country" value={applyForm.country} onChange={e => setApplyForm({...applyForm, country: e.target.value})} required />
              <Input placeholder="Address" value={applyForm.address} onChange={e => setApplyForm({...applyForm, address: e.target.value})} required />
            </div>
            <Button type="submit" className="w-full" isLoading={applyMutation.isPending}>Submit Application</Button>
          </form>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold font-display">{myNgo.name}</h1>
            {myNgo.status === 'verified' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
          </div>
          <Badge variant={myNgo.status === 'verified' ? 'success' : myNgo.status === 'pending' ? 'warning' : 'destructive'} className="text-sm">
            Status: {myNgo.status.toUpperCase()}
          </Badge>
        </div>
        
        {myNgo.status === 'verified' && (
          <Button size="lg" onClick={() => setCampaignOpen(true)}>
            <PlusCircle className="w-5 h-5 mr-2" /> New Campaign
          </Button>
        )}
      </div>

      {myNgo.status === 'pending' && (
        <Card className="p-8 border-yellow-200 bg-yellow-50/50 mb-8 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-full text-yellow-700">
             <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-yellow-900">Application Under Review</h3>
            <p className="text-yellow-800 text-sm">Our admins are reviewing your documents. You will be able to create campaigns once verified.</p>
          </div>
        </Card>
      )}

      {myNgo.status === 'rejected' && (
        <Card className="p-8 border-red-200 bg-red-50/50 mb-8 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-full text-red-700">
             <Ban className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-red-900">Application Rejected</h3>
            <p className="text-red-800 text-sm">Please contact support for more information regarding your rejection.</p>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold border-b border-border pb-4">My Campaigns</h2>
        
        {campaignsLoading ? (
           <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : myCampaigns.length === 0 ? (
           <div className="text-center py-16 text-muted-foreground">
             <p>No campaigns yet.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {myCampaigns.map(campaign => (
               <Card key={campaign._id} className="p-6">
                 <div className="flex justify-between items-start mb-4">
                   <h3 className="font-bold text-lg truncate">{campaign.title}</h3>
                   <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>{campaign.status}</Badge>
                 </div>
                 <div className="space-y-2 mb-6">
                   <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">Goal:</span>
                     <span className="font-semibold">{formatCurrency(campaign.goalAmount)}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">Raised:</span>
                     <span className="font-semibold text-primary">{formatCurrency(campaign.raisedAmount)}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">Donors:</span>
                     <span className="font-semibold">{campaign.totalDonors}</span>
                   </div>
                 </div>
                 
                 {campaign.status === 'active' && (
                   <Button 
                     variant="destructive" 
                     className="w-full" 
                     onClick={async () => {
                       if(confirm("Are you sure you want to close this campaign?")) {
                         try {
                           await closeCampaign.mutateAsync(campaign._id);
                           toast.success("Campaign closed");
                         } catch(e:any) { toast.error(e.message); }
                       }
                     }}
                   >
                     Close Campaign
                   </Button>
                 )}
               </Card>
             ))}
           </div>
        )}
      </div>

      <Dialog isOpen={campaignOpen} onClose={() => setCampaignOpen(false)} title="Create Campaign">
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <Input placeholder="Campaign Title" value={campaignForm.title} onChange={e => setCampaignForm({...campaignForm, title: e.target.value})} required />
          <Textarea placeholder="Detailed Description" value={campaignForm.description} onChange={e => setCampaignForm({...campaignForm, description: e.target.value})} required />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-muted-foreground">Goal Amount ($)</label>
              <Input type="number" min="100" placeholder="10000" value={campaignForm.goalAmount} onChange={e => setCampaignForm({...campaignForm, goalAmount: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-muted-foreground">Category</label>
              <select 
                className="flex w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                value={campaignForm.category}
                onChange={e => setCampaignForm({...campaignForm, category: e.target.value})}
              >
                {["education", "health", "environment", "disaster-relief", "poverty", "human-rights", "arts", "animal-welfare", "other"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-muted-foreground">Start Date</label>
              <Input type="date" value={campaignForm.startDate} onChange={e => setCampaignForm({...campaignForm, startDate: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-muted-foreground">End Date</label>
              <Input type="date" value={campaignForm.endDate} onChange={e => setCampaignForm({...campaignForm, endDate: e.target.value})} required />
            </div>
          </div>
          
          <div>
             <label className="block text-xs font-semibold mb-1 text-muted-foreground">Beneficiaries target</label>
             <Input placeholder="e.g. 500 Students" value={campaignForm.beneficiaries} onChange={e => setCampaignForm({...campaignForm, beneficiaries: e.target.value})} required />
          </div>

          <Button type="submit" className="w-full mt-4" isLoading={createCampaign.isPending}>Launch Campaign</Button>
        </form>
      </Dialog>
    </div>
  );
}
