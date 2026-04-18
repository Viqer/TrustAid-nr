import { useState } from 'react';
import { Link, Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useNgos, useApplyNgo } from '@/hooks/use-ngos';
import { getNgoUserId } from '@/lib/ngo-utils';
import { Card, Button, Input, Textarea, Badge, Dialog } from '@/components/ui';
import { Building2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { NgoApplyForm } from '@/types';

const emptyApplyForm = (): NgoApplyForm => ({
  name: '',
  description: '',
  registrationNumber: '',
  website: '',
  phone: '',
  country: '',
  address: '',
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: ngos, isLoading } = useNgos();
  const applyMutation = useApplyNgo();

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyForm, setApplyForm] = useState<NgoApplyForm>(emptyApplyForm());

  const myNgo = ngos?.find((n) => getNgoUserId(n) === user?.id);

  if (!user) return <Redirect to="/login" />;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await applyMutation.mutateAsync(applyForm);
      toast.success('Application submitted! Please wait for admin verification.');
      setApplyOpen(false);
      setApplyForm(emptyApplyForm());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to apply';
      toast.error(message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <UserCircle className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-4xl font-bold font-display mb-1">Profile</h1>
          <p className="text-muted-foreground">Your account details and NGO application.</p>
        </div>
      </div>

      <Card className="p-8 mb-8 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Email</p>
          <p className="text-lg font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Role</p>
          <Badge variant="default" className="capitalize">
            {user.role.toLowerCase()}
          </Badge>
        </div>
      </Card>

      {user.role === 'DONOR' && (
        <Card className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <Building2 className="w-10 h-10 text-muted-foreground shrink-0" />
            <div>
              <h2 className="text-xl font-bold mb-1">Organizations</h2>
              <p className="text-sm text-muted-foreground">
                New accounts are created as donors. To list campaigns as an organization, apply for NGO verification.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : myNgo ? (
            <div className="rounded-xl border border-border bg-muted/30 p-6">
              <p className="font-semibold mb-2">{myNgo.organizationName}</p>
              <Badge
                variant={
                  myNgo.verificationStatus === 'VERIFIED'
                    ? 'success'
                    : myNgo.verificationStatus === 'PENDING'
                      ? 'warning'
                      : 'destructive'
                }
              >
                {myNgo.verificationStatus}
              </Badge>
              <p className="text-sm text-muted-foreground mt-4">
                {myNgo.verificationStatus === 'VERIFIED'
                  ? 'Your organization is verified. You can manage campaigns from the NGO dashboard.'
                  : myNgo.verificationStatus === 'PENDING'
                    ? 'Your application is under review.'
                    : 'Your application was not approved. Contact support if you need help.'}
              </p>
              {myNgo.verificationStatus === 'VERIFIED' && (
                <Link href="/ngo-dashboard">
                  <Button className="mt-4">Open NGO dashboard</Button>
                </Link>
              )}
            </div>
          ) : (
            <Button size="lg" onClick={() => setApplyOpen(true)}>
              Apply as NGO
            </Button>
          )}

          <Dialog isOpen={applyOpen} onClose={() => setApplyOpen(false)} title="NGO application">
            <form onSubmit={handleApply} className="space-y-4 text-left">
              <Input
                placeholder="Organization name"
                value={applyForm.name}
                onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                required
              />
              <Input
                placeholder="Registration number"
                value={applyForm.registrationNumber}
                onChange={(e) => setApplyForm({ ...applyForm, registrationNumber: e.target.value })}
                required
              />
              <Textarea
                placeholder="Organization description"
                value={applyForm.description}
                onChange={(e) => setApplyForm({ ...applyForm, description: e.target.value })}
                required
              />
              <Input
                type="tel"
                placeholder="Phone (organization contact)"
                value={applyForm.phone}
                onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                required
              />
              <Input
                placeholder="Website URL (optional)"
                value={applyForm.website}
                onChange={(e) => setApplyForm({ ...applyForm, website: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Country"
                  value={applyForm.country}
                  onChange={(e) => setApplyForm({ ...applyForm, country: e.target.value })}
                  required
                />
                <Input
                  placeholder="Street address"
                  value={applyForm.address}
                  onChange={(e) => setApplyForm({ ...applyForm, address: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" isLoading={applyMutation.isPending}>
                Submit application
              </Button>
            </form>
          </Dialog>
        </Card>
      )}

      {user.role === 'NGO' && (
        <Card className="p-8">
          <h2 className="text-xl font-bold mb-2">NGO account</h2>
          <p className="text-muted-foreground mb-4">Manage your organization and campaigns from the NGO dashboard.</p>
          <Link href="/ngo-dashboard">
            <Button>Go to NGO dashboard</Button>
          </Link>
        </Card>
      )}

      {user.role === 'ADMIN' && (
        <Card className="p-8">
          <h2 className="text-xl font-bold mb-2">Administrator</h2>
          <p className="text-muted-foreground mb-4">Use the admin panel to review NGO applications.</p>
          <Link href="/admin">
            <Button variant="outline">Open admin panel</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
