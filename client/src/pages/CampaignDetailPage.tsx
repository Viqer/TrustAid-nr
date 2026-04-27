import { useState } from 'react';
import { useRoute } from 'wouter';
import { useCampaign } from '@/hooks/use-campaigns';
import { useDummyDonate } from '@/hooks/use-donations';
import { Button, Card, Badge, Progress, Dialog, Input } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Heart, ShieldCheck, Users, Calendar, AlertCircle, CircleCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

export default function CampaignDetailPage() {
  const [, singularParams] = useRoute('/campaign/:id');
  const [, pluralParams] = useRoute('/campaigns/:id');
  const id = singularParams?.id || pluralParams?.id || '';
  
  const { data: campaign, isLoading } = useCampaign(id);
  const { user } = useAuth();
  
  const [donateOpen, setDonateOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const dummyDonate = useDummyDonate();

  const rawEndDate = campaign?.endDate || (campaign as { deadline?: string } | undefined)?.deadline;
  const parsedEndDate = rawEndDate ? new Date(rawEndDate) : null;
  const formattedEndDate = parsedEndDate && !Number.isNaN(parsedEndDate.getTime())
    ? format(parsedEndDate, 'MMM d, yyyy')
    : 'N/A';

  if (isLoading) return <div className="p-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>;
  if (!campaign) return <div className="p-20 text-center text-xl font-bold">Campaign not found</div>;

  const campaignStatus = String(campaign.status || '').toUpperCase();
  const isCampaignActive = campaign.isActive !== false && campaignStatus === 'ACTIVE';

  const progress = Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

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
      const result = await dummyDonate.mutateAsync({ campaignId: id, amount: numAmount });
      setTxHash(result.txHash);
      toast.success("Donation confirmed on blockchain!");
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process donation';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCloseDialog = () => {
    setDonateOpen(false);
    setSubmitError(null);
    setAmount('');
    setTxHash(null);
  };

  const truncatedTxHash = txHash ? `${txHash.slice(0, 10)}...${txHash.slice(-6)}` : null;

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
              {isCampaignActive ? (
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
                  <p className="font-semibold">{formattedEndDate}</p>
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
                onClick={() => {
                  setDonateOpen(true);
                  setSubmitError(null);
                  setTxHash(null);
                }}
                disabled={!isCampaignActive}
              >
                <Heart className="w-5 h-5 mr-2 fill-current" /> 
                {isCampaignActive ? 'Donate Now' : 'Campaign Closed'}
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

      <Dialog isOpen={donateOpen} onClose={handleCloseDialog} title={`Donate to ${campaign.title}`}>
        {txHash ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900">
              <div className="flex items-center gap-3 mb-3">
                <CircleCheck className="w-6 h-6 text-green-700" />
                <p className="font-semibold text-lg">Donation of ₹{amount} recorded!</p>
              </div>
              <p className="text-sm">Blockchain TX: {truncatedTxHash}</p>
            </div>

            <a href={`/ledger?tx=${txHash}`} className="block">
              <Button className="w-full h-12 text-base">View on Ledger</Button>
            </a>

            <Button variant="outline" className="w-full" onClick={handleCloseDialog}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleDonate} className="space-y-6">
            {!user && (
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl mb-4 text-sm font-medium">
                You must be logged in as a Donor to make a donation.
              </div>
            )}

            {submitError && (
              <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
                {submitError}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">Donation Amount (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
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
                  ₹{val}
                </Button>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg"
              isLoading={dummyDonate.isPending}
              disabled={!user || user.role !== 'DONOR' || dummyDonate.isPending}
            >
              {dummyDonate.isPending ? 'Processing on blockchain...' : 'Donate (Test)'}
            </Button>
          </form>
        )}
      </Dialog>
    </div>
  );
}
