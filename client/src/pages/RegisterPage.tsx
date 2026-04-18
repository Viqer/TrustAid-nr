import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const trimmed = formData.name.trim();
      const parts = trimmed.split(/\s+/).filter(Boolean);
      const firstName = parts[0] || 'Donor';
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : firstName;

      const res: any = await fetchApi('/auth/register', {
        method: 'POST',
        data: {
          email: formData.email,
          password: formData.password,
          firstName,
          lastName,
          role: 'DONOR',
        },
      });
      setToken(res.token);
      toast.success("Account created successfully!");
      setLocation('/');
    } catch (err: any) {
      toast.error(err.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold font-display">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join the TrustAid platform</p>
        </div>

        <Card className="p-8 shadow-xl shadow-black/5">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Full name</label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="John Doe" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                placeholder="you@example.com" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <Input 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                placeholder="••••••••" 
                required 
                minLength={6}
              />
            </div>
            
            <Button type="submit" className="w-full h-12 text-lg mt-4" isLoading={isLoading}>
              Create Account
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
