import { useState } from 'react';
import { useRoute } from 'wouter';
import { useCampaign } from '@/hooks/use-campaigns';
import { useCreateDonation, useConfirmDonation } from '@/hooks/use-donations';
import { Button, Card, Badge, Progress, Dialog, Input } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Heart, ShieldCheck, Users, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

export default function CampaignDetailPage() {
  const [, params] = useRoute('/campaign/:id');
  const id = params?.id || '';
  
  const { data: campaign, isLoading } = useCampaign(id);
  const { user } = useAuth();
  
  const [donateOpen, setDonateOpen] = useState(false);
  const [amount, setAmount] = useState('');
  
  const createDonation = useCreateDonation();
  const confirmDonation = useConfirmDonation();

  if (isLoading) return <div className="p-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>;
  if (!campaign) return <div className="p-20 text-center text-xl font-bold">Campaign not found</div>;

  const progress = Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to donate");
      return;
    }
    if (user.role !== 'DONOR') {
      toast.error("Only donors can make donations");
      return;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const donRes = await createDonation.mutateAsync({ campaignId: id, amount: numAmount });
      
      toast.success("Initiating blockchain transaction...");
      
      // Simulate blockchain tx
      setTimeout(async () => {
        const hash = '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
        try {
          await confirmDonation.mutateAsync({ id: donRes._id, blockchainTxHash: hash });
          toast.success("Donation confirmed on blockchain!");
          setDonateOpen(false);
          setAmount('');
        } catch (err: any) {
          toast.error("Failed to confirm donation: " + err.message);
        }
      }, 1500);
      
    } catch (err: any) {
      toast.error(err.message || "Failed to create donation");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* landing page abstract hero for detail */}
          <div className="rounded-3xl overflow-hidden shadow-xl shadow-black/5 aspect-[16/9] relative">
             <img 
                src={`https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&h=800&fit=crop`} 
                alt="Campaign"
                className="w-full h-full object-cover"
              />
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="uppercase tracking-wider">{campaign.category}</Badge>
              {campaign.status === 'active' ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="default" className="bg-gray-200">Closed</Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">{campaign.title}</h1>
            
            <div className="flex flex-wrap gap-6 py-6 border-y border-border mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Verified NGO</p>
                  <p className="font-semibold">{campaign.ngo?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Beneficiaries</p>
                  <p className="font-semibold">{campaign.beneficiaries}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Ends on</p>
                  <p className="font-semibold">{format(new Date(campaign.endDate), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <h3 className="text-foreground text-2xl font-bold font-display mb-4">About the Campaign</h3>
              <p className="whitespace-pre-line leading-relaxed">{campaign.description}</p>
            </div>
          </div>
        </div>
        
        {/* Sidebar Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <Card className="p-8 shadow-2xl shadow-primary/5 border-primary/20 bg-gradient-to-b from-background to-accent/5">
              <div className="mb-8">
                <p className="text-4xl font-extrabold text-foreground mb-2">
                  {formatCurrency(campaign.raisedAmount)}
                </p>
                <p className="text-muted-foreground font-medium mb-6">
                  raised of {formatCurrency(campaign.goalAmount)} goal
                </p>
                
                <Progress value={progress} className="h-4 mb-4" />
                
                <div className="flex justify-between text-sm font-semibold">
                  <span>{progress.toFixed(1)}% Funded</span>
                  <span>{campaign.totalDonors} Donors</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full text-lg h-16 shadow-xl shadow-primary/25"
                onClick={() => setDonateOpen(true)}
                disabled={campaign.status !== 'active'}
              >
                <Heart className="w-5 h-5 mr-2 fill-current" /> 
                {campaign.status === 'active' ? 'Donate Now' : 'Campaign Closed'}
              </Button>
              
              <div className="mt-6 flex items-start gap-3 bg-muted/50 p-4 rounded-xl text-sm">
                <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-muted-foreground leading-relaxed">
                  Your donation is securely tracked on the blockchain for complete transparency.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog isOpen={donateOpen} onClose={() => setDonateOpen(false)} title={`Donate to ${campaign.title}`}>
        <form onSubmit={handleDonate} className="space-y-6">
          {!user && (
             <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl mb-4 text-sm font-medium">
                You must be logged in as a Donor to make a donation.
             </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-2">Donation Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
              <Input 
                type="number" 
                min="1" 
                step="1"
                placeholder="100" 
                className="pl-8 text-lg font-bold h-14"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[50, 100, 500].map(val => (
              <Button 
                key={val} 
                type="button" 
                variant="outline" 
                onClick={() => setAmount(val.toString())}
                className={amount === val.toString() ? 'border-primary text-primary bg-primary/5' : ''}
              >
                ${val}
              </Button>
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 text-lg" 
            isLoading={createDonation.isPending || confirmDonation.isPending}
            disabled={!user || user.role !== 'DONOR'}
          >
            Confirm Donation
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
