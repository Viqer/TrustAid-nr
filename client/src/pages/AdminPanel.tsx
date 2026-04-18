import { useAuth } from '@/hooks/use-auth';
import { useNgos, useVerifyNgo } from '@/hooks/use-ngos';
import { Card, Badge, Button } from '@/components/ui';
import { Redirect } from 'wouter';
import { Check, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPanel() {
  const { user } = useAuth();
  const { data: ngos, isLoading } = useNgos();
  const verifyMutation = useVerifyNgo();

  if (!user) return <Redirect to="/login" />;
  if (user.role !== 'ADMIN') return <div className="p-20 text-center font-bold">Access Denied. Admin Area.</div>;

  const pendingNgos = ngos?.filter((n) => n.verificationStatus === 'PENDING') || [];
  const reviewedNgos = ngos?.filter((n) => n.verificationStatus !== 'PENDING') || [];

  const handleAction = async (id: string, status: 'verified' | 'rejected') => {
    try {
      await verifyMutation.mutateAsync({ id, status });
      toast.success(`NGO has been ${status}`);
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display">Admin Control Panel</h1>
          <p className="text-muted-foreground">Review and verify NGO applications.</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        Pending Verification 
        <Badge variant="warning" className="ml-2">{pendingNgos.length}</Badge>
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : pendingNgos.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground mb-12">
          No pending applications to review.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 mb-16">
          {pendingNgos.map(ngo => (
            <Card key={ngo._id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1 flex-1">
                <h3 className="text-2xl font-bold">{ngo.organizationName}</h3>
                <p className="text-sm text-muted-foreground">Reg No: {ngo.registrationNumber}</p>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm bg-muted/30 p-4 rounded-xl">
                  <div><span className="font-semibold text-foreground">Email:</span>{' '}
                    {typeof ngo.userId === 'object' && ngo.userId && 'email' in ngo.userId
                      ? (ngo.userId as { email?: string }).email ?? '—'
                      : '—'}
                  </div>
                  <div><span className="font-semibold text-foreground">Website:</span> {ngo.website || 'N/A'}</div>
                  <div><span className="font-semibold text-foreground">Country:</span> {ngo.address?.country ?? '—'}</div>
                  <div><span className="font-semibold text-foreground">Address:</span>{' '}
                    {[ngo.address?.street, ngo.address?.city].filter(Boolean).join(', ') || '—'}
                  </div>
                </div>
                <p className="text-sm mt-4 italic text-muted-foreground">"{ngo.description}"</p>
              </div>
              <div className="flex flex-col gap-3 min-w-[140px] w-full md:w-auto">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-green-600/20" 
                  onClick={() => handleAction(ngo._id, 'verified')}
                  disabled={verifyMutation.isPending}
                >
                  <Check className="w-4 h-4 mr-2" /> Approve
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => handleAction(ngo._id, 'rejected')}
                  disabled={verifyMutation.isPending}
                >
                  <X className="w-4 h-4 mr-2" /> Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold mb-6">Recently Reviewed</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviewedNgos.map(ngo => (
          <Card key={ngo._id} className="p-5 flex justify-between items-center bg-muted/20 border-dashed">
            <span className="font-semibold truncate mr-4">{ngo.organizationName}</span>
            <Badge variant={ngo.verificationStatus === 'VERIFIED' ? 'success' : 'destructive'}>
              {ngo.verificationStatus}
            </Badge>
          </Card>
        ))}
        {reviewedNgos.length === 0 && <div className="col-span-3 text-muted-foreground">No reviewed NGOs yet.</div>}
      </div>
    </div>
  );
}
