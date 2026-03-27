import { useAuth } from '@/hooks/use-auth';
import { useDonorDonations } from '@/hooks/use-donations';
import { Card, Badge, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ExternalLink, ReceiptText, ArrowRight } from 'lucide-react';
import { Link, Redirect } from 'wouter';

export default function DonorDashboard() {
  const { user } = useAuth();
  const { data: donations, isLoading } = useDonorDonations();

  if (!user) return <Redirect to="/login" />;
  if (user.role !== 'DONOR') return <div className="p-20 text-center font-bold">Access Denied. Only Donors.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold font-display mb-2">My Impact</h1>
        <p className="text-muted-foreground text-lg">Track your donations and blockchain confirmations.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
      ) : donations && donations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <Card key={donation._id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <Badge variant={donation.status === 'confirmed' ? 'success' : donation.status === 'pending' ? 'warning' : 'destructive'}>
                    {donation.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-medium">
                    {format(new Date(donation.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold mb-1 truncate">{donation.campaign?.title || 'Unknown Campaign'}</h3>
                <p className="text-3xl font-extrabold text-foreground mb-6">{formatCurrency(donation.amount)}</p>
                
                {donation.blockchainTxHash ? (
                  <div className="bg-muted rounded-lg p-3 text-xs font-mono break-all text-muted-foreground border border-border">
                    <span className="font-semibold text-foreground block mb-1">Tx Hash:</span>
                    {donation.blockchainTxHash}
                  </div>
                ) : (
                   <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm border border-yellow-200">
                     Awaiting blockchain confirmation.
                   </div>
                )}
              </div>
              
              <Link href={`/campaign/${donation.campaign?._id || ''}`} className="mt-6 block">
                 <Button variant="outline" className="w-full group">
                   View Campaign <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                 </Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-16 text-center border-dashed bg-muted/30">
          <ReceiptText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No donations yet</h2>
          <p className="text-muted-foreground mb-8">Your impact journey starts here. Explore active campaigns to contribute.</p>
          <Link href="/">
            <Button size="lg">Explore Campaigns</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
